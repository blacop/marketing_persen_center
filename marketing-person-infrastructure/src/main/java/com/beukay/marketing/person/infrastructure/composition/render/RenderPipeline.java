package com.beukay.marketing.person.infrastructure.composition.render;

import com.beukay.marketing.person.client.composition.enums.ChapterAudioMode;
import com.beukay.marketing.person.client.composition.enums.RenderStatus;
import com.beukay.marketing.person.domain.composition.gateway.ObjectStorageGateway;
import com.beukay.marketing.person.domain.composition.gateway.RenderJobGateway;
import com.beukay.marketing.person.domain.composition.gateway.RenderOutputGateway;
import com.beukay.marketing.person.domain.composition.model.ChapterPlan;
import com.beukay.marketing.person.domain.composition.model.ClipPick;
import com.beukay.marketing.person.domain.composition.model.CompositionPlan;
import com.beukay.marketing.person.domain.composition.model.RenderConfig;
import com.beukay.marketing.person.domain.composition.model.RenderJob;
import com.beukay.marketing.person.domain.composition.model.RenderOutput;
import com.beukay.marketing.person.infrastructure.composition.oss.OssProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 单条 RenderOutput 渲染流水线：下载 → 章节合成 → 拼接 → 上传 → 元信息回写。
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class RenderPipeline {

    private final FfmpegRunner ffmpegRunner;
    private final RenderJobGateway renderJobGateway;
    private final RenderOutputGateway renderOutputGateway;
    private final ObjectStorageGateway objectStorageGateway;
    private final CompositionRenderProperties props;
    private final OssProperties ossProperties;
    private final ObjectMapper objectMapper;
    private final RenderProgressEmitter progressEmitter;
    private final DavinciScriptWriter davinciScriptWriter;

    public void render(Long jobId, Long outputId) {
        RenderOutput output = renderOutputGateway.findById(outputId);
        if (output == null) {
            log.warn("[render] output not found id={}", outputId);
            return;
        }
        if (RenderStatus.CANCELLED.name().equals(output.getStatus())) {
            return;
        }

        Path workspace = Paths.get(props.getWorkspaceDir(), String.valueOf(jobId), String.valueOf(outputId));
        boolean success = false;
        boolean keepWorkspace = false;
        try {
            Files.createDirectories(workspace);
            output.setStatus(RenderStatus.ASSEMBLING.name());
            output.setStartedAt(LocalDateTime.now());
            output = renderOutputGateway.save(output);
            emit(jobId, outputId, "ASSEMBLING", 5);

            CompositionPlan plan = parsePlan(output.getPlanSnapshot());
            if (plan == null) {
                throw new IllegalStateException("invalid planSnapshot for output " + outputId);
            }

            // 加载 RenderJob 拿本次配置；解析为 effective 渲染参数（覆盖 plan 默认值）
            RenderJob job = renderJobGateway.findById(jobId);
            EffectiveConfig eff = resolveEffective(job == null ? null : job.getRenderConfig(), plan);
            boolean isDavinci = eff.exportType() != null
                    && ("DIRECT".equalsIgnoreCase(eff.exportType()) || "PREVIEW_EDIT".equalsIgnoreCase(eff.exportType()));

            // 1. 下载所有素材 + 配音到 workspace
            output.setStatus(RenderStatus.DOWNLOADING.name());
            renderOutputGateway.save(output);
            emit(jobId, outputId, "DOWNLOADING", 15);
            Map<String, Path> ossKeyToLocal = downloadAssets(plan, workspace);

            output.setStatus(RenderStatus.ENCODING.name());
            renderOutputGateway.save(output);
            emit(jobId, outputId, "ENCODING", 35);

            String ossKey;
            ProbeInfo probe;
            if (isDavinci) {
                // DaVinci 模式：跳过 ffmpeg，生成 .lua 脚本由用户在 Resolve Console 跑
                Path luaPath = writeDavinciScript(plan, eff, ossKeyToLocal, jobId, outputId);
                emit(jobId, outputId, "ENCODING", 80);
                output.setStatus(RenderStatus.UPLOADING.name());
                renderOutputGateway.save(output);
                emit(jobId, outputId, "UPLOADING", 90);
                ossKey = "local://" + luaPath.toAbsolutePath();
                long dur = plan.getEstimatedDurationMs() == null ? 0 : plan.getEstimatedDurationMs();
                long size = 0;
                try { size = Files.size(luaPath); } catch (IOException ignored) {}
                probe = new ProbeInfo(dur, eff.width(), eff.height(), size);
            } else {
                // LEGACY / null：跑 ffmpeg 主流水线
                List<Path> chapterMp4s = renderChapters(plan, ossKeyToLocal, workspace, eff);
                String ext = "MOV".equals(eff.container()) ? "mov" : "mp4";
                Path finalOut = workspace.resolve("final." + ext);
                concatChapters(chapterMp4s, finalOut, plan, ossKeyToLocal, eff);
                emit(jobId, outputId, "ENCODING", 75);
                probe = probeOutput(finalOut);

                output.setStatus(RenderStatus.UPLOADING.name());
                renderOutputGateway.save(output);
                emit(jobId, outputId, "UPLOADING", 90);

                ossKey = uploadOrLocal(finalOut, jobId, outputId, ext);
                copyToExportPath(finalOut, eff.exportPath(), outputId, ext);
            }

            output.setOssKey(ossKey);
            output.setDurationMs(probe.durationMs);
            output.setWidth(probe.width);
            output.setHeight(probe.height);
            output.setFileSize(probe.fileSize);
            output.setStatus(RenderStatus.SUCCESS.name());
            output.setFinishedAt(LocalDateTime.now());
            renderOutputGateway.save(output);
            emit(jobId, outputId, "SUCCESS", 100);
            success = true;
        } catch (Exception ex) {
            log.error("[render] output {} failed", outputId, ex);
            output.setStatus(RenderStatus.FAILED.name());
            output.setErrorMsg(truncate(ex.getMessage(), 1000));
            output.setFinishedAt(LocalDateTime.now());
            renderOutputGateway.save(output);
            emit(jobId, outputId, "FAILED", 0);
        } finally {
            updateJobAggregate(jobId);
            if (!success && !props.isKeepWorkspaceOnFailure()) {
                deleteRecursive(workspace);
            } else if (success && !keepWorkspace) {
                deleteRecursive(workspace);
            }
        }
    }

    private CompositionPlan parsePlan(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, CompositionPlan.class);
        } catch (JsonProcessingException e) {
            log.warn("[render] parse plan failed", e);
            return null;
        }
    }

    private Map<String, Path> downloadAssets(CompositionPlan plan, Path workspace) {
        Map<String, Path> map = new HashMap<>();
        if (plan.getGlobalBgmOssKey() != null) {
            map.put(plan.getGlobalBgmOssKey(), download(plan.getGlobalBgmOssKey(), workspace));
        }
        for (ChapterPlan ch : plan.getChapters()) {
            if (ch.getVoiceoverOssKey() != null && !map.containsKey(ch.getVoiceoverOssKey())) {
                map.put(ch.getVoiceoverOssKey(), download(ch.getVoiceoverOssKey(), workspace));
            }
            for (ClipPick p : ch.getPicks()) {
                if (!map.containsKey(p.getOssKey())) {
                    map.put(p.getOssKey(), download(p.getOssKey(), workspace));
                }
            }
        }
        return map;
    }

    private Path download(String key, Path workspace) {
        String safeName = key.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path target = workspace.resolve(safeName);
        // OSS 未配置时素材以 local://绝对路径 形式入库（见 LocalFileController），直接 copy
        if (key.startsWith("local://")) {
            Path source = Paths.get(key.substring("local://".length()));
            try {
                Files.createDirectories(target.getParent());
                Files.copy(source, target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                return target;
            } catch (IOException e) {
                throw new IllegalStateException("local material copy failed: " + key, e);
            }
        }
        return objectStorageGateway.download(key, target);
    }

    private List<Path> renderChapters(CompositionPlan plan,
                                       Map<String, Path> assetMap,
                                       Path workspace,
                                       EffectiveConfig eff) {
        List<Path> chapterMp4s = new ArrayList<>();
        int chIdx = 0;
        int targetW = eff.width();
        int targetH = eff.height();
        int targetFps = eff.fps();

        for (ChapterPlan ch : plan.getChapters()) {
            chIdx++;
            Path chapterMp4 = workspace.resolve("chapter_" + chIdx + ".mp4");

            ChapterAudioMode mode = ChapterAudioMode.valueOf(ch.getAudioMode());
            boolean strip = Boolean.TRUE.equals(ch.getStripOriginalAudio());
            boolean hasVoiceover = ch.getVoiceoverOssKey() != null
                    && (mode == ChapterAudioMode.ONE_VO_MULTI_CLIP
                        || mode == ChapterAudioMode.FILL_CLIPS_FOR_VO
                        || mode == ChapterAudioMode.LOOP_CLIP_FOR_VO);
            // 章节内每个 pick 是否保留素材原音：strip=true 全部去音；
            // strip=false 时除「有配音 + 覆盖原音」（也就是 strip=true）外都保留
            boolean keepClipAudio = !strip;

            // Step A: 拼章节中间 mp4（带或不带原音）
            Path mid = workspace.resolve("chapter_" + chIdx + "_mid.mp4");
            buildChapterVideo(ch, assetMap, mid, targetW, targetH, targetFps, workspace, keepClipAudio, eff);

            // Step B: 4 种组合决定最终音轨
            try { Files.deleteIfExists(chapterMp4); } catch (IOException ignored) {}
            if (!hasVoiceover) {
                // 无配音：mid 已按 keepClipAudio 处理过，直接复制
                copy(mid, chapterMp4);
            } else if (strip) {
                // 有配音 + 去除原音：mid 无音，挂配音
                Path voPath = assetMap.get(ch.getVoiceoverOssKey());
                muxAudio(mid, voPath, chapterMp4);
            } else {
                // 有配音 + 保留原音：mid 带原音，与配音 amix 混合
                Path voPath = assetMap.get(ch.getVoiceoverOssKey());
                mixAudio(mid, voPath, chapterMp4);
            }
            chapterMp4s.add(chapterMp4);
        }
        return chapterMp4s;
    }

    private Path chapterMp4Safe(Path p) { return p; }

    private void buildChapterVideo(ChapterPlan ch, Map<String, Path> assets, Path out,
                                    int w, int h, int fps, Path workspace, boolean keepOriginalAudio,
                                    EffectiveConfig eff) {
        // 每个 pick → trim & scale → 中间 mp4，再 concat demuxer 拼接。
        // 输出始终带 aac 44.1k stereo 音轨（确保下游 concat 编码一致）：
        //   keepOriginalAudio=true：amix 原音（若有）+ 静音兜底
        //   keepOriginalAudio=false：直接用静音替代（map 1:a）
        List<Path> intermediates = new ArrayList<>();
        int idx = 0;
        for (ClipPick p : ch.getPicks()) {
            idx++;
            Path src = assets.get(p.getOssKey());
            Path mid = workspace.resolve("ch_pick_" + ch.getChapterId() + "_" + idx + ".mp4");
            double startSec = (p.getStartMs() == null ? 0 : p.getStartMs()) / 1000.0;
            double durSec = (p.getTakenDurationMs() == null ? 0 : p.getTakenDurationMs()) / 1000.0;
            StringBuilder vfBuilder = new StringBuilder();
            vfBuilder.append(String.format("scale=%d:%d:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2:black,setsar=1",
                    w, h, w, h));
            // 随机裁剪：在 [trimMin, trimMax]/100 区间随机放大后中心裁剪回 w×h
            if (eff.trimMin() != null && eff.trimMax() != null && eff.trimMax() > 100) {
                int lo = Math.max(100, eff.trimMin());
                int hi = Math.max(lo + 1, eff.trimMax());
                int rPct = ThreadLocalRandom.current().nextInt(lo, hi + 1);
                if (rPct > 100) {
                    int zw = (int) Math.round(w * rPct / 100.0);
                    int zh = (int) Math.round(h * rPct / 100.0);
                    // 必须保证为偶数（libx264 yuv420p 限制）
                    if (zw % 2 != 0) zw++;
                    if (zh % 2 != 0) zh++;
                    vfBuilder.append(String.format(",scale=%d:%d,crop=%d:%d:(in_w-%d)/2:(in_h-%d)/2", zw, zh, w, h, w, h));
                }
            }
            // 镜像翻转：文件名以 t= 开头视为锁定
            String origName = p.getOriginalName() == null ? "" : p.getOriginalName();
            boolean locked = origName.toLowerCase().startsWith("t=");
            if (!locked && eff.mirrorProb() != null && eff.mirrorProb() > 0) {
                int roll = ThreadLocalRandom.current().nextInt(100);
                if (roll < eff.mirrorProb()) {
                    vfBuilder.append(",hflip");
                }
            }
            String vf = vfBuilder.toString();

            List<String> args = new ArrayList<>();
            args.add("-y");
            args.add("-ss"); args.add(String.format("%.3f", startSec));
            args.add("-i"); args.add(src.toString());
            // 第二输入：静音音轨（既作为兜底也作为 strip 时的替代音轨）
            args.add("-f"); args.add("lavfi");
            args.add("-t"); args.add(String.format("%.3f", durSec));
            args.add("-i"); args.add("anullsrc=channel_layout=stereo:sample_rate=44100");
            args.add("-t"); args.add(String.format("%.3f", durSec));
            args.add("-vf"); args.add(vf);
            args.add("-r"); args.add(String.valueOf(fps));
            if (keepOriginalAudio) {
                // 原音(若有) + 静音 amix。0:a:0? 让无音源素材也能跑通。
                args.add("-filter_complex");
                args.add("[0:a:0?]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[a0];" +
                        "[1:a]aformat=sample_fmts=fltp:channel_layouts=stereo[a1];" +
                        "[a0][a1]amix=inputs=2:duration=first:dropout_transition=0[aout]");
                args.add("-map"); args.add("0:v:0");
                args.add("-map"); args.add("[aout]");
            } else {
                // 用静音替代原音（保留 aac 音轨以便后续 concat / mux 一致）
                args.add("-map"); args.add("0:v:0");
                args.add("-map"); args.add("1:a");
            }
            args.add("-c:v"); args.add("libx264");
            args.add("-preset"); args.add("veryfast");
            args.add("-pix_fmt"); args.add("yuv420p");
            args.add("-c:a"); args.add("aac");
            args.add("-b:a"); args.add("128k");
            args.add(mid.toString());
            ffmpegRunner.exec(args, workspace);
            intermediates.add(mid);
        }
        // concat demuxer
        Path listFile = workspace.resolve("ch_" + ch.getChapterId() + "_list.txt");
        StringBuilder sb = new StringBuilder();
        for (Path p : intermediates) {
            sb.append("file '").append(p.toAbsolutePath()).append("'\n");
        }
        try { Files.writeString(listFile, sb.toString()); } catch (IOException e) {
            throw new IllegalStateException("write concat list failed", e);
        }
        ffmpegRunner.exec(List.of(
                "-y", "-f", "concat", "-safe", "0", "-i", listFile.toString(),
                "-c", "copy", out.toString()
        ), workspace);
    }

    private void muxAudio(Path silentVideo, Path audio, Path out) {
        ffmpegRunner.exec(List.of(
                "-y",
                "-i", silentVideo.toString(),
                "-i", audio.toString(),
                "-c:v", "copy",
                "-c:a", "aac", "-b:a", "128k",
                "-shortest",
                out.toString()
        ), out.getParent());
    }

    /** 视频已带音轨，与配音混合（amix）。视频音被压低 0.6，配音保持 1.0 突出。 */
    private void mixAudio(Path videoWithAudio, Path voiceover, Path out) {
        ffmpegRunner.exec(List.of(
                "-y",
                "-i", videoWithAudio.toString(),
                "-i", voiceover.toString(),
                "-filter_complex",
                "[0:a]volume=0.6[a0];[1:a]volume=1.0[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=0[aout]",
                "-map", "0:v:0", "-map", "[aout]",
                "-c:v", "copy",
                "-c:a", "aac", "-b:a", "128k",
                out.toString()
        ), out.getParent());
    }

    private void copy(Path src, Path dst) {
        try { Files.copy(src, dst, java.nio.file.StandardCopyOption.REPLACE_EXISTING); }
        catch (IOException e) { throw new IllegalStateException("copy failed", e); }
    }

    private void concatChapters(List<Path> chapterMp4s, Path finalOut,
                                 CompositionPlan plan, Map<String, Path> assets,
                                 EffectiveConfig eff) {
        Path listFile = finalOut.getParent().resolve("final_list.txt");
        StringBuilder sb = new StringBuilder();
        for (Path p : chapterMp4s) {
            sb.append("file '").append(p.toAbsolutePath()).append("'\n");
        }
        try { Files.writeString(listFile, sb.toString()); } catch (IOException e) {
            throw new IllegalStateException("write final concat list failed", e);
        }

        boolean isMov = "MOV".equalsIgnoreCase(eff.container());
        boolean isHevc = "HEVC".equalsIgnoreCase(eff.codec());
        // 中间 mp4 全部 h264，非 HEVC 且非 MOV 时可走 -c copy 快速拼接；
        // 否则 final 阶段重编码到目标 codec/container
        String videoCodec = isHevc ? "libx265" : "libx264";
        boolean reencodeFinal = isHevc || isMov;
        List<String> faststart = isMov ? List.of() : List.of("-movflags", "+faststart");

        if (plan.getGlobalBgmOssKey() != null) {
            Path concatTmp = finalOut.getParent().resolve("final_concat.mp4");
            ffmpegRunner.exec(List.of(
                    "-y", "-f", "concat", "-safe", "0", "-i", listFile.toString(),
                    "-c", "copy", concatTmp.toString()
            ), finalOut.getParent());
            // 全局 BGM 与现有音轨混音
            Path bgm = assets.get(plan.getGlobalBgmOssKey());
            List<String> args = new ArrayList<>();
            args.add("-y");
            args.add("-i"); args.add(concatTmp.toString());
            args.add("-stream_loop"); args.add("-1");
            args.add("-i"); args.add(bgm.toString());
            args.add("-filter_complex");
            args.add("[1:a]volume=0.3[bgm];[0:a][bgm]amix=inputs=2:duration=first:dropout_transition=0");
            if (reencodeFinal) {
                args.add("-c:v"); args.add(videoCodec);
                args.add("-preset"); args.add("veryfast");
                args.add("-pix_fmt"); args.add("yuv420p");
            } else {
                args.add("-c:v"); args.add("copy");
            }
            args.add("-c:a"); args.add("aac");
            args.add("-b:a"); args.add("192k");
            args.add("-shortest");
            args.addAll(faststart);
            args.add(finalOut.toString());
            ffmpegRunner.exec(args, finalOut.getParent());
        } else if (reencodeFinal) {
            // 无 BGM 但需要重编码（HEVC 或 MOV）
            List<String> args = new ArrayList<>();
            args.add("-y");
            args.add("-f"); args.add("concat");
            args.add("-safe"); args.add("0");
            args.add("-i"); args.add(listFile.toString());
            args.add("-c:v"); args.add(videoCodec);
            args.add("-preset"); args.add("veryfast");
            args.add("-pix_fmt"); args.add("yuv420p");
            args.add("-c:a"); args.add("aac");
            args.add("-b:a"); args.add("192k");
            args.addAll(faststart);
            args.add(finalOut.toString());
            ffmpegRunner.exec(args, finalOut.getParent());
        } else {
            // h264 + mp4：直接 copy 最快
            List<String> args = new ArrayList<>();
            args.add("-y");
            args.add("-f"); args.add("concat");
            args.add("-safe"); args.add("0");
            args.add("-i"); args.add(listFile.toString());
            args.add("-c"); args.add("copy");
            args.addAll(faststart);
            args.add(finalOut.toString());
            ffmpegRunner.exec(args, finalOut.getParent());
        }
    }

    private record ProbeInfo(Long durationMs, Integer width, Integer height, Long fileSize) {}

    private ProbeInfo probeOutput(Path mp4) {
        // duration
        String durStr = ffmpegRunner.probe(List.of(
                "-v", "error", "-show_entries", "format=duration",
                "-of", "default=nw=1:nk=1", mp4.toString()
        ), mp4.getParent());
        long durationMs = 0;
        try { durationMs = (long) (Double.parseDouble(durStr.trim()) * 1000); } catch (Exception ignored) {}

        // width/height
        String dim = ffmpegRunner.probe(List.of(
                "-v", "error", "-select_streams", "v:0",
                "-show_entries", "stream=width,height",
                "-of", "csv=p=0", mp4.toString()
        ), mp4.getParent()).trim();
        Integer w = null, h = null;
        if (dim.contains(",")) {
            String[] parts = dim.split(",");
            try { w = Integer.parseInt(parts[0].trim()); } catch (Exception ignored) {}
            try { h = Integer.parseInt(parts[1].trim()); } catch (Exception ignored) {}
        }
        long size = 0;
        try { size = Files.size(mp4); } catch (IOException ignored) {}
        return new ProbeInfo(durationMs, w, h, size);
    }

    private String uploadOrLocal(Path videoFile, Long jobId, Long outputId, String ext) {
        boolean ossOk = ossProperties.getAccessKeyId() != null && !ossProperties.getAccessKeyId().isBlank();
        if (!ossOk) {
            if (props.isFallbackToLocalIfOssMissing()) {
                Path persistent = Paths.get(props.getWorkspaceDir(), "outputs",
                        String.valueOf(jobId), outputId + "." + ext);
                try {
                    Files.createDirectories(persistent.getParent());
                    Files.copy(videoFile, persistent, StandardCopyOption.REPLACE_EXISTING);
                } catch (IOException e) {
                    throw new IllegalStateException("local persist failed", e);
                }
                return "local://" + persistent.toAbsolutePath();
            }
            throw new IllegalStateException("OSS not configured");
        }
        String contentType = "mov".equalsIgnoreCase(ext) ? "video/quicktime" : "video/mp4";
        String key = String.format("composition/default/output/%d/%d/%s.%s",
                jobId, outputId, UUID.randomUUID().toString().replace("-", ""), ext);
        try (var in = Files.newInputStream(videoFile)) {
            objectStorageGateway.upload(key, in, contentType, Files.size(videoFile));
        } catch (IOException e) {
            throw new IllegalStateException("upload failed", e);
        }
        return key;
    }

    /** 生成 DaVinci Resolve 自动剪辑脚本目录到 exportPath（无配置则落到 workspace/outputs/<jobId>/）。 */
    private Path writeDavinciScript(CompositionPlan plan, EffectiveConfig eff,
                                     Map<String, Path> assetMap, Long jobId, Long outputId) throws IOException {
        Path parent;
        if (eff.exportPath() != null && !eff.exportPath().isBlank()) {
            parent = Paths.get(eff.exportPath());
        } else {
            parent = Paths.get(props.getWorkspaceDir(), "outputs", String.valueOf(jobId));
        }
        Files.createDirectories(parent);
        DavinciScriptWriter.Args args = new DavinciScriptWriter.Args();
        args.parentDir = parent;
        args.name = "composition_" + outputId + "_" + plan.getPlanHash().substring(0, 8);
        args.plan = plan;
        args.canvasW = eff.width();
        args.canvasH = eff.height();
        args.fps = eff.fps();
        args.codec = eff.codec();
        args.container = eff.container();
        args.exportType = eff.exportType();
        args.assetMap = assetMap;
        // DaVinci 渲染产物输出位置：默认放到 exportPath 的同级 renders 子目录
        args.renderOutputDir = parent.resolve("renders");
        return davinciScriptWriter.writeScript(args);
    }

    private void copyToExportPath(Path videoFile, String exportPath, Long outputId, String ext) {
        if (exportPath == null || exportPath.isBlank()) return;
        try {
            Path dir = Paths.get(exportPath);
            Files.createDirectories(dir);
            Path target = dir.resolve(outputId + "." + ext);
            Files.copy(videoFile, target, StandardCopyOption.REPLACE_EXISTING);
            log.info("[render] copied output {} to {}", outputId, target);
        } catch (Exception e) {
            log.warn("[render] copy to exportPath {} failed: {}", exportPath, e.getMessage());
        }
    }

    private record EffectiveConfig(int width, int height, int fps,
                                    String container, String codec,
                                    Integer mirrorProb, Integer trimMin, Integer trimMax,
                                    String exportType, String exportPath) {}

    private EffectiveConfig resolveEffective(RenderConfig cfg, CompositionPlan plan) {
        int planW = plan.getOutputWidth() == null ? 1080 : plan.getOutputWidth();
        int planH = plan.getOutputHeight() == null ? 1920 : plan.getOutputHeight();
        int planFps = plan.getOutputFps() == null ? 30 : plan.getOutputFps();
        if (cfg == null) {
            return new EffectiveConfig(planW, planH, planFps, "MP4", "H264",
                    0, 100, 100, "LEGACY", null);
        }
        int[] wh = resolveWH(cfg.getAspectRatio(), cfg.getResolution(), planW, planH);
        int fps = cfg.getFps() == null ? planFps : cfg.getFps();
        return new EffectiveConfig(
                wh[0], wh[1], fps,
                cfg.getContainer() == null ? "MP4" : cfg.getContainer(),
                cfg.getCodec() == null ? "H264" : cfg.getCodec(),
                cfg.getMirrorProb(), cfg.getTrimMin(), cfg.getTrimMax(),
                cfg.getExportType(), cfg.getExportPath()
        );
    }

    /** 输出分辨率：短边 = 720/1080/2160；长边按比例。w/h 强制偶数（libx264 yuv420p 限制）。 */
    private int[] resolveWH(String aspect, String resolution, int defaultW, int defaultH) {
        int shortSide = "720P".equalsIgnoreCase(resolution) ? 720
                : "4K".equalsIgnoreCase(resolution) ? 2160
                : "1080P".equalsIgnoreCase(resolution) ? 1080 : 0;
        if (shortSide == 0 || aspect == null) return new int[]{defaultW, defaultH};
        int w, h;
        switch (aspect) {
            case "9:16" -> { w = shortSide; h = (int) Math.round(shortSide * 16.0 / 9.0); }
            case "3:4"  -> { w = shortSide; h = (int) Math.round(shortSide * 4.0 / 3.0); }
            case "16:9" -> { w = (int) Math.round(shortSide * 16.0 / 9.0); h = shortSide; }
            case "4:3"  -> { w = (int) Math.round(shortSide * 4.0 / 3.0); h = shortSide; }
            case "1:1"  -> { w = shortSide; h = shortSide; }
            default     -> { return new int[]{defaultW, defaultH}; }
        }
        if (w % 2 != 0) w++;
        if (h % 2 != 0) h++;
        return new int[]{w, h};
    }

    private void updateJobAggregate(Long jobId) {
        RenderJob job = renderJobGateway.findById(jobId);
        if (job == null) return;
        List<RenderOutput> outputs = renderOutputGateway.findByJobId(jobId);
        int success = 0, failed = 0, done = 0;
        for (RenderOutput o : outputs) {
            if (RenderStatus.SUCCESS.name().equals(o.getStatus())) { success++; done++; }
            else if (RenderStatus.FAILED.name().equals(o.getStatus())) { failed++; done++; }
            else if (RenderStatus.CANCELLED.name().equals(o.getStatus())) { done++; }
        }
        job.setSuccessCount(success);
        job.setFailedCount(failed);
        int total = job.getTotalCount() == null ? outputs.size() : job.getTotalCount();
        if (total > 0) {
            job.setProgressPercent((int) Math.round(done * 100.0 / total));
        }
        if (done >= total) {
            if (failed == 0 && success == total) {
                job.setStatus(RenderStatus.SUCCESS.name());
            } else if (success > 0) {
                job.setStatus(RenderStatus.PARTIAL.name());
            } else {
                job.setStatus(RenderStatus.FAILED.name());
            }
            job.setFinishedAt(LocalDateTime.now());
            renderJobGateway.save(job);
            progressEmitter.complete(jobId, Map.of(
                    "jobId", jobId, "status", job.getStatus(),
                    "success", success, "failed", failed, "total", total
            ));
        } else {
            renderJobGateway.save(job);
        }
    }

    private void emit(Long jobId, Long outputId, String stage, int percent) {
        progressEmitter.emit(jobId, Map.of(
                "jobId", jobId, "outputId", outputId,
                "stage", stage, "percent", percent
        ));
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }

    private void deleteRecursive(Path path) {
        if (path == null || !Files.exists(path)) return;
        try (var stream = Files.walk(path)) {
            stream.sorted((a, b) -> b.getNameCount() - a.getNameCount())
                  .forEach(p -> { try { Files.deleteIfExists(p); } catch (IOException ignored) {} });
        } catch (IOException ignored) {}
    }
}
