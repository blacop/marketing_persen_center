package com.beukay.marketing.person.app.cutmatrix.tool;

import com.beukay.marketing.person.app.cutmatrix.linkingest.asr.AsrAdapter;
import com.beukay.marketing.person.app.cutmatrix.runtime.CmAssetStorageService;
import com.beukay.marketing.person.app.cutmatrix.runtime.CmFFmpegRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.beukay.ai.common.exception.GenericBusinessException;
/**
 * Cutmatrix 原子小工具实现：
 *   1. AspectConvert  — scale + crop 按目标比例
 *   2. AudioOps       — 去原声 / 加 BGM / 音量
 *   3. UniformSplit   — 平均切分
 *   4. SilenceFilter  — silencedetect + 反向 trim
 *   5. SceneSplit     — scenedetect + 多段输出
 *   6. SubtitleErase  — FFmpeg delogo/black 或阿里云 VIAPI 智能擦除（已移除本地 Python AI 模式）
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class CmToolService {

    private final CmAssetStorageService storage;
    private final CmFFmpegRunner ffmpeg;
    private final AliyunVideoEraseAdapter aliyunErase;
    private final AsrAdapter asr;

    // ─── 1. 转换比例 ─────────────────────────────────────────
    public CmToolDtos.ToolResultDto aspectConvert(CmToolDtos.AspectConvertCmd cmd) throws IOException, InterruptedException {
        Path input = require(cmd.getInputAssetCode());
        int shortEdge = cmd.getShortEdge() != null ? cmd.getShortEdge() : 1080;
        int[] wh = parseAspectToDims(cmd.getTargetAspect(), shortEdge);
        String mode = cmd.getMode() == null ? "crop" : cmd.getMode();

        String outCode = "ren-" + UUID.randomUUID().toString().replace("-", "");
        Path output = storage.allocateRenderOutput(outCode, "mp4");

        String vf = mode.equals("fit")
                ? String.format("scale=w=%d:h=%d:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2:black,setsar=1", wh[0], wh[1], wh[0], wh[1])
                : String.format("scale=w=%d:h=%d:force_original_aspect_ratio=increase,crop=%d:%d,setsar=1", wh[0], wh[1], wh[0], wh[1]);

        var r = ffmpeg.runFfmpeg(List.of(
                "-y", "-i", input.toString(),
                "-vf", vf,
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
                "-c:a", "aac", "-b:a", "128k",
                output.toString()
        ));
        return finishSingle(r, outCode, output);
    }

    // ─── 2. 操作视频声音 ─────────────────────────────────────
    public CmToolDtos.ToolResultDto audioOps(CmToolDtos.AudioOpsCmd cmd) throws IOException, InterruptedException {
        Path input = require(cmd.getInputAssetCode());
        boolean removeOrig = Boolean.TRUE.equals(cmd.getRemoveOriginal());
        Path bgm = cmd.getBgmAssetCode() != null && !cmd.getBgmAssetCode().isBlank() ? require(cmd.getBgmAssetCode()) : null;
        double vol = cmd.getVolume() != null ? cmd.getVolume() : 1.0;
        double bgmVol = cmd.getBgmVolume() != null ? cmd.getBgmVolume() : 0.3;

        String outCode = "ren-" + UUID.randomUUID().toString().replace("-", "");
        Path output = storage.allocateRenderOutput(outCode, "mp4");

        List<String> args = new ArrayList<>();
        args.add("-y");
        args.add("-i"); args.add(input.toString());
        if (bgm != null) {
            args.add("-stream_loop"); args.add("-1");
            args.add("-i"); args.add(bgm.toString());
        }
        args.add("-c:v"); args.add("copy");
        if (bgm != null) {
            // 复合滤镜：原声(可选) + BGM 混合
            String filter;
            if (removeOrig) {
                filter = String.format("[1:a]volume=%.2f,atrim=duration=999999[bgm];[bgm]anull[aout]", bgmVol);
            } else {
                filter = String.format("[0:a]volume=%.2f[a0];[1:a]volume=%.2f[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=2[aout]", vol, bgmVol);
            }
            args.add("-filter_complex"); args.add(filter);
            args.add("-map"); args.add("0:v");
            args.add("-map"); args.add("[aout]");
            args.add("-shortest");
        } else if (removeOrig) {
            args.add("-an");
        } else {
            args.add("-af"); args.add(String.format("volume=%.2f", vol));
        }
        args.add("-c:a"); args.add("aac"); args.add("-b:a"); args.add("128k");
        args.add(output.toString());

        var r = ffmpeg.runFfmpeg(args);
        return finishSingle(r, outCode, output);
    }

    // ─── 3. 平均切分 ─────────────────────────────────────────
    public CmToolDtos.ToolResultDto uniformSplit(CmToolDtos.UniformSplitCmd cmd) throws IOException, InterruptedException {
        Path input = require(cmd.getInputAssetCode());
        int seg = cmd.getSegmentSec() != null ? cmd.getSegmentSec() : 5;

        String outBase = "ren-" + UUID.randomUUID().toString().replace("-", "");
        Path renderDir = storage.allocateTempDir(outBase);
        String pattern = renderDir.resolve("part_%03d.mp4").toString();

        var r = ffmpeg.runFfmpeg(List.of(
                "-y", "-i", input.toString(),
                "-c", "copy",
                "-map", "0",
                "-f", "segment",
                "-segment_time", String.valueOf(seg),
                "-reset_timestamps", "1",
                pattern
        ));
        if (!r.ok()) return failResult(r);

        // 把切片移到 renders 目录，每段独立 assetCode
        List<String> codes = new ArrayList<>();
        List<String> urls = new ArrayList<>();
        try (var stream = Files.list(renderDir)) {
            stream.sorted(Comparator.comparing(p -> p.getFileName().toString())).forEach(p -> {
                String code = "ren-" + UUID.randomUUID().toString().replace("-", "");
                try {
                    Path target = storage.allocateRenderOutput(code, "mp4");
                    Files.move(p, target);
                    codes.add(code);
                    urls.add(storage.streamUrl(code));
                } catch (IOException e) {
                    log.warn("[UniformSplit] move failed: {}", e.getMessage());
                }
            });
        }
        return CmToolDtos.ToolResultDto.builder()
                .status("SUCCEEDED")
                .resultAssetCodes(codes)
                .streamUrls(urls)
                .message("split into " + codes.size() + " parts of ~" + seg + "s each")
                .build();
    }

    // ─── 4. 极速过滤（剔除静音段） ─────────────────────────
    /** 节奏预设：dB 阈值 / 最小静音秒 / 前保留秒 / 后保留秒 */
    private static final double[] PACING_SLOW   = {-40, 0.8, 0.30, 0.20};
    private static final double[] PACING_MEDIUM = {-30, 0.5, 0.15, 0.10};
    private static final double[] PACING_FAST   = {-25, 0.3, 0.05, 0.05};

    /** 仅支持的输入格式（避免 zip/jpeg 等垃圾文件直接送进 ffmpeg） */
    private static final java.util.Set<String> ALLOWED_EXT = java.util.Set.of(
            "mp3", "wav", "m4a", "aac", "flac", "ogg", "opus",
            "mp4", "mov", "mkv", "webm", "avi", "flv"
    );

    public CmToolDtos.ToolResultDto silenceFilter(CmToolDtos.SilenceFilterCmd cmd) throws IOException, InterruptedException {
        Path input = require(cmd.getInputAssetCode());

        // 输入格式校验：拒绝 zip/jpeg/png/未知
        String fileName = input.getFileName().toString().toLowerCase();
        int dot = fileName.lastIndexOf('.');
        String ext = dot >= 0 ? fileName.substring(dot + 1) : "";
        if (!ALLOWED_EXT.contains(ext)) {
            return CmToolDtos.ToolResultDto.builder()
                    .status("FAILED")
                    .message("不支持的文件格式：." + ext + "，仅支持音频/视频文件")
                    .build();
        }

        // 应用节奏预设（custom 走传入参数）
        double[] preset = resolvePacing(cmd.getPacing());
        int noiseDb        = cmd.getNoiseDb()       != null ? cmd.getNoiseDb()       : (int) preset[0];
        double minSilence  = cmd.getMinSilenceSec() != null ? cmd.getMinSilenceSec() : preset[1];
        double padBefore   = cmd.getPadBeforeSec()  != null ? cmd.getPadBeforeSec()  : preset[2];
        double padAfter    = cmd.getPadAfterSec()   != null ? cmd.getPadAfterSec()   : preset[3];
        boolean headTailOnly = Boolean.TRUE.equals(cmd.getHeadTailOnly());

        // 是否为纯音频（决定 -map / -c:v 行为）
        boolean isAudio = isAudioExt(ext);

        // step 1: 检测静音区间
        var detect = ffmpeg.runFfmpeg(List.of(
                "-i", input.toString(),
                "-af", String.format("silencedetect=noise=%ddB:d=%.2f", noiseDb, minSilence),
                "-f", "null", "-"
        ));
        List<double[]> silences = parseSilences(detect.stderr());
        var probe = ffmpeg.probe(input);
        double totalDur = probe.durationSec();

        // 仅去除片头片尾静音模式：只保留首段静音之后到尾段静音之前
        List<double[]> keep;
        if (headTailOnly) {
            keep = computeHeadTailKeep(silences, totalDur);
        } else {
            keep = invertSilences(silences, totalDur);
            // 加上前后保留（pad）：扩展每段的边界，并合并相邻段
            keep = applyPadAndMerge(keep, padBefore, padAfter, totalDur);
        }

        if (keep.isEmpty()) {
            return CmToolDtos.ToolResultDto.builder()
                    .status("FAILED")
                    .message("整段都是静音，无可保留片段")
                    .stderrTail(tail(detect.stderr()))
                    .build();
        }

        // step 2: 用 trim/concat 保留有声段
        String outExt = isAudio ? "m4a" : "mp4";
        String outCode = "ren-" + UUID.randomUUID().toString().replace("-", "");
        Path output = storage.allocateRenderOutput(outCode, outExt);

        StringBuilder filter = new StringBuilder();
        for (int i = 0; i < keep.size(); i++) {
            double[] kp = keep.get(i);
            if (!isAudio) {
                filter.append(String.format("[0:v]trim=start=%.3f:end=%.3f,setpts=PTS-STARTPTS[v%d];", kp[0], kp[1], i));
            }
            filter.append(String.format("[0:a]atrim=start=%.3f:end=%.3f,asetpts=PTS-STARTPTS[a%d];", kp[0], kp[1], i));
        }
        for (int i = 0; i < keep.size(); i++) {
            if (!isAudio) filter.append(String.format("[v%d]", i));
            filter.append(String.format("[a%d]", i));
        }
        if (isAudio) {
            filter.append(String.format("concat=n=%d:v=0:a=1[outa]", keep.size()));
        } else {
            filter.append(String.format("concat=n=%d:v=1:a=1[outv][outa]", keep.size()));
        }

        List<String> args = new ArrayList<>(List.of(
                "-y", "-i", input.toString(),
                "-filter_complex", filter.toString()
        ));
        if (isAudio) {
            args.add("-map"); args.add("[outa]");
            args.add("-c:a"); args.add("aac"); args.add("-b:a"); args.add("192k");
        } else {
            args.add("-map"); args.add("[outv]");
            args.add("-map"); args.add("[outa]");
            args.add("-c:v"); args.add("libx264"); args.add("-preset"); args.add("veryfast"); args.add("-crf"); args.add("23");
            args.add("-c:a"); args.add("aac"); args.add("-b:a"); args.add("128k");
        }
        args.add(output.toString());

        var r = ffmpeg.runFfmpeg(args);
        var dto = finishSingle(r, outCode, output);
        if (dto.getStatus().equals("SUCCEEDED")) {
            double cutSec = silences.stream().mapToDouble(s -> s[1] - s[0]).sum();
            dto.setMessage(String.format("过滤 %d 段静音(共 %.1fs)，保留 %d 段有声片段；阈值 %ddB、最小静音 %.2fs、前后保留 %.2f/%.2fs%s",
                    silences.size(), cutSec, keep.size(), noiseDb, minSilence, padBefore, padAfter,
                    headTailOnly ? "（仅去片头片尾）" : ""));
        }
        return dto;
    }

    private static double[] resolvePacing(String pacing) {
        if (pacing == null) return PACING_MEDIUM;
        return switch (pacing.toLowerCase()) {
            case "slow"   -> PACING_SLOW;
            case "fast"   -> PACING_FAST;
            case "medium" -> PACING_MEDIUM;
            default       -> PACING_MEDIUM;
        };
    }

    private static boolean isAudioExt(String ext) {
        return java.util.Set.of("mp3", "wav", "m4a", "aac", "flac", "ogg", "opus").contains(ext);
    }

    /** 加 pad 并合并相邻段（pad 后可能 overlap） */
    static List<double[]> applyPadAndMerge(List<double[]> keep, double padBefore, double padAfter, double totalDur) {
        if (keep.isEmpty()) return keep;
        List<double[]> padded = new ArrayList<>();
        for (double[] k : keep) {
            double s = Math.max(0, k[0] - padBefore);
            double e = Math.min(totalDur, k[1] + padAfter);
            padded.add(new double[]{s, e});
        }
        // 合并相邻 / overlap
        List<double[]> merged = new ArrayList<>();
        merged.add(padded.get(0));
        for (int i = 1; i < padded.size(); i++) {
            double[] last = merged.get(merged.size() - 1);
            double[] cur = padded.get(i);
            if (cur[0] <= last[1] + 0.01) {
                last[1] = Math.max(last[1], cur[1]);
            } else {
                merged.add(cur);
            }
        }
        return merged;
    }

    /** 仅去片头片尾静音：保留 [首段静音末尾, 尾段静音开始] */
    static List<double[]> computeHeadTailKeep(List<double[]> silences, double totalDur) {
        double start = 0;
        double end = totalDur;
        if (!silences.isEmpty()) {
            double[] first = silences.get(0);
            if (first[0] <= 0.05) start = first[1];
            double[] last = silences.get(silences.size() - 1);
            if (last[1] >= totalDur - 0.05) end = last[0];
        }
        if (end - start < 0.05) return List.of();
        List<double[]> out = new ArrayList<>();
        out.add(new double[]{start, end});
        return out;
    }

    // ─── 5. 按场景拆解视频 ──────────────────────────────────
    public CmToolDtos.ToolResultDto sceneSplit(CmToolDtos.SceneSplitCmd cmd) throws IOException, InterruptedException {
        Path input = require(cmd.getInputAssetCode());
        double threshold = cmd.getSceneThreshold() != null ? cmd.getSceneThreshold() : 0.4;
        double minSeg = cmd.getMinSegmentSec() != null ? cmd.getMinSegmentSec() : 1.5;

        // step 1: 用 showinfo + select=gt(scene,T) 找到场景切换帧时间戳
        var detect = ffmpeg.runFfmpeg(List.of(
                "-i", input.toString(),
                "-vf", String.format("select='gt(scene,%.2f)',showinfo", threshold),
                "-f", "null", "-"
        ));
        List<Double> changeTs = parseSceneChanges(detect.stderr());
        var probe = ffmpeg.probe(input);
        double totalDur = probe.durationSec();

        List<double[]> segments = new ArrayList<>();
        double prev = 0;
        for (double t : changeTs) {
            if (t - prev >= minSeg) {
                segments.add(new double[]{prev, t});
                prev = t;
            }
        }
        if (totalDur - prev >= minSeg) segments.add(new double[]{prev, totalDur});
        if (segments.isEmpty()) segments.add(new double[]{0, totalDur});

        // step 2: 切片输出
        List<String> codes = new ArrayList<>();
        List<String> urls = new ArrayList<>();
        for (double[] seg : segments) {
            String code = "ren-" + UUID.randomUUID().toString().replace("-", "");
            Path output = storage.allocateRenderOutput(code, "mp4");
            var r = ffmpeg.runFfmpeg(List.of(
                    "-y", "-ss", String.format("%.3f", seg[0]),
                    "-i", input.toString(),
                    "-t", String.format("%.3f", seg[1] - seg[0]),
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
                    "-c:a", "aac", "-b:a", "128k",
                    output.toString()
            ));
            if (r.ok()) {
                codes.add(code);
                urls.add(storage.streamUrl(code));
            }
        }
        return CmToolDtos.ToolResultDto.builder()
                .status(codes.isEmpty() ? "FAILED" : "SUCCEEDED")
                .resultAssetCodes(codes)
                .streamUrls(urls)
                .message("识别 " + changeTs.size() + " 个场景边界，输出 " + codes.size() + " 段（min " + minSeg + "s）")
                .build();
    }

    // ─── 6. 擦除字幕 ─────────────────────────────────────────
    /**
     * 抹除视频指定区域内的字幕或水印。
     *
     * fillMode=delogo（默认）：FFmpeg 周边像素插值修复，速度快；
     * fillMode=black：黑色矩形直接覆盖，最快；
     * fillMode=aliyun：调用阿里云 VIAPI EraseVideoSubtitles，AI 修复，效果最优。
     *   — aliyun 模式要求视频 URL 可被阿里云公网访问，需配置 cutmatrix.base-url 为公网地址。
     */
    public CmToolDtos.ToolResultDto subtitleErase(CmToolDtos.SubtitleEraseCmd cmd) throws Exception {
        Path input = require(cmd.getInputAssetCode());

        List<CmToolDtos.SubtitleEraseCmd.RegionPct> regions = cmd.getRegions();
        if (regions == null || regions.isEmpty()) {
            regions = List.of(CmToolDtos.SubtitleEraseCmd.RegionPct.builder()
                    .x(0).y(72).w(100).h(14).build());
        }

        String fillMode = cmd.getFillMode() == null ? "delogo" : cmd.getFillMode();

        // ── 阿里云智能擦除分支 ────────────────────────────────
        if ("aliyun".equals(fillMode)) {
            return subtitleEraseAliyun(cmd.getInputAssetCode(), input, regions);
        }

        // ── FFmpeg 本地处理（delogo / black） ─────────────────
        var probe = ffmpeg.probe(input);
        int vidW = probe.width();
        int vidH = probe.height();

        String vf = buildEraseFilter(regions, vidW, vidH, fillMode);

        String outCode = "ren-" + UUID.randomUUID().toString().replace("-", "");
        Path output = storage.allocateRenderOutput(outCode, "mp4");

        var r = ffmpeg.runFfmpeg(List.of(
                "-y", "-i", input.toString(),
                "-vf", vf,
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
                "-c:a", "copy",
                output.toString()
        ));
        var dto = finishSingle(r, outCode, output);
        if (dto.getStatus().equals("SUCCEEDED")) {
            dto.setMessage(String.format("已擦除 %d 个字幕区域，fillMode=%s", regions.size(), fillMode));
        }
        return dto;
    }

    /**
     * 阿里云 VIAPI 智能擦除流程：
     *   1. 用 stream URL 提交给阿里云 API
     *   2. 获取 OSS 临时结果 URL
     *   3. 下载到本地 renders 目录
     *   4. 返回本地 asset code + stream URL
     */
    private CmToolDtos.ToolResultDto subtitleEraseAliyun(
            String assetCode,
            Path input,
            List<CmToolDtos.SubtitleEraseCmd.RegionPct> regions) throws Exception {

        var probe = ffmpeg.probe(input);
        int vidW = probe.width();
        int vidH = probe.height();

        List<AliyunVideoEraseAdapter.PixelRegion> pixelRegions = regions.stream()
                .map(r -> new AliyunVideoEraseAdapter.PixelRegion(
                        clamp((int) Math.round(r.getX() / 100.0 * vidW), 0, vidW - 2),
                        clamp((int) Math.round(r.getY() / 100.0 * vidH), 0, vidH - 2),
                        clamp((int) Math.round(r.getW() / 100.0 * vidW), 2, vidW),
                        clamp((int) Math.round(r.getH() / 100.0 * vidH), 2, vidH)
                ))
                .toList();

        String videoUrl = storage.streamUrl(assetCode);
        log.info("[SubtitleErase/aliyun] assetCode={} videoUrl={} regions={}", assetCode, videoUrl, pixelRegions.size());

        String resultOssUrl;
        try {
            resultOssUrl = aliyunErase.erase(videoUrl, pixelRegions);
        } catch (Exception e) {
            log.error("[SubtitleErase/aliyun] erase failed videoUrl={}", videoUrl, e);
            return CmToolDtos.ToolResultDto.builder()
                    .status("FAILED")
                    .message("阿里云智能擦除失败: " + e)
                    .build();
        }

        String outCode = "ren-" + UUID.randomUUID().toString().replace("-", "");
        Path output = storage.allocateRenderOutput(outCode, "mp4");

        try {
            aliyunErase.downloadToPath(resultOssUrl, output);
        } catch (Exception e) {
            return CmToolDtos.ToolResultDto.builder()
                    .status("FAILED")
                    .message("下载阿里云擦除结果失败: " + e.getMessage())
                    .build();
        }

        double dur = 0;
        try { dur = ffmpeg.probe(output).durationSec(); } catch (Exception ignore) { /**/ }

        return CmToolDtos.ToolResultDto.builder()
                .status("SUCCEEDED")
                .resultAssetCode(outCode)
                .streamUrl(storage.streamUrl(outCode))
                .durationSec(dur)
                .message(String.format("已用阿里云 VIAPI 智能擦除处理 %d 个字幕区域", regions.size()))
                .build();
    }

    /** 将百分比区域列表转为 FFmpeg vf 滤镜串 */
    private String buildEraseFilter(
            List<CmToolDtos.SubtitleEraseCmd.RegionPct> regions,
            int vidW, int vidH, String fillMode) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < regions.size(); i++) {
            var reg = regions.get(i);
            int px = clamp((int) Math.round(reg.getX() / 100.0 * vidW), 0, vidW - 2);
            int py = clamp((int) Math.round(reg.getY() / 100.0 * vidH), 0, vidH - 2);
            int pw = clamp((int) Math.round(reg.getW() / 100.0 * vidW), 2, vidW - px);
            int ph = clamp((int) Math.round(reg.getH() / 100.0 * vidH), 2, vidH - py);
            if (i > 0) sb.append(",");
            if ("black".equals(fillMode)) {
                sb.append(String.format("drawbox=x=%d:y=%d:w=%d:h=%d:color=black:t=fill", px, py, pw, ph));
            } else {
                // delogo: FFmpeg 专用水印/字幕擦除，用周边像素修复
                sb.append(String.format("delogo=x=%d:y=%d:w=%d:h=%d:show=0", px, py, pw, ph));
            }
        }
        return sb.toString();
    }

    private static int clamp(int v, int min, int max) { return Math.max(min, Math.min(max, v)); }

    // ─── helpers ────────────────────────────────────────────
    private Path require(String code) {
        Path p = storage.resolveAssetByCode(code);
        if (p == null) throw new GenericBusinessException("asset not found: " + code);
        return p;
    }

    private CmToolDtos.ToolResultDto finishSingle(CmFFmpegRunner.Result r, String code, Path output) {
        if (!r.ok()) return failResult(r);
        double dur = 0;
        try { dur = ffmpeg.probe(output).durationSec(); } catch (Exception ignore) {/**/}
        return CmToolDtos.ToolResultDto.builder()
                .status("SUCCEEDED")
                .resultAssetCode(code)
                .streamUrl(storage.streamUrl(code))
                .durationSec(dur)
                .build();
    }

    private CmToolDtos.ToolResultDto failResult(CmFFmpegRunner.Result r) {
        return CmToolDtos.ToolResultDto.builder()
                .status("FAILED")
                .message("ffmpeg exit=" + r.exitCode())
                .stderrTail(tail(r.stderr()))
                .build();
    }

    private static String tail(String s) {
        if (s == null) return "";
        int max = 1024;
        return s.length() > max ? s.substring(s.length() - max) : s;
    }

    private static int[] parseAspectToDims(String aspect, int shortEdge) {
        if (aspect == null || aspect.isBlank()) aspect = "9:16";
        String[] parts = aspect.split(":");
        int w = Integer.parseInt(parts[0].trim());
        int h = Integer.parseInt(parts[1].trim());
        // shortEdge 对应较小的那条边
        if (w <= h) {
            int outW = shortEdge;
            int outH = (int) Math.round((double) shortEdge * h / w);
            return new int[]{outW, evenize(outH)};
        } else {
            int outH = shortEdge;
            int outW = (int) Math.round((double) shortEdge * w / h);
            return new int[]{evenize(outW), outH};
        }
    }
    private static int evenize(int v) { return v % 2 == 0 ? v : v + 1; }

    private static final Pattern P_SILENCE_START = Pattern.compile("silence_start:\\s*(-?\\d+(?:\\.\\d+)?)");
    private static final Pattern P_SILENCE_END = Pattern.compile("silence_end:\\s*(\\d+(?:\\.\\d+)?)");

    static List<double[]> parseSilences(String stderr) {
        List<double[]> out = new ArrayList<>();
        if (stderr == null) return out;
        Matcher mStart = P_SILENCE_START.matcher(stderr);
        Matcher mEnd = P_SILENCE_END.matcher(stderr);
        List<Double> starts = new ArrayList<>();
        List<Double> ends = new ArrayList<>();
        while (mStart.find()) starts.add(Double.parseDouble(mStart.group(1)));
        while (mEnd.find()) ends.add(Double.parseDouble(mEnd.group(1)));
        int n = Math.min(starts.size(), ends.size());
        for (int i = 0; i < n; i++) {
            double s = Math.max(0, starts.get(i));
            double e = ends.get(i);
            if (e > s) out.add(new double[]{s, e});
        }
        return out;
    }

    static List<double[]> invertSilences(List<double[]> silences, double totalDur) {
        List<double[]> keep = new ArrayList<>();
        double cursor = 0;
        for (double[] s : silences) {
            if (s[0] - cursor > 0.05) keep.add(new double[]{cursor, s[0]});
            cursor = s[1];
        }
        if (totalDur - cursor > 0.05) keep.add(new double[]{cursor, totalDur});
        return keep;
    }

    private static final Pattern P_SHOWINFO_T = Pattern.compile("pts_time:(\\d+(?:\\.\\d+)?)");
    static List<Double> parseSceneChanges(String stderr) {
        List<Double> out = new ArrayList<>();
        if (stderr == null) return out;
        Matcher m = P_SHOWINFO_T.matcher(stderr);
        while (m.find()) out.add(Double.parseDouble(m.group(1)));
        return out;
    }

    // ─── 7. 生成字幕 ────────────────────────────────────────────────
    /** ASR 转写 → 输出 SRT/VTT；可选烧录字幕回视频 */
    public CmToolDtos.ToolResultDto subtitleGen(CmToolDtos.SubtitleGenCmd cmd) throws Exception {
        Path video = require(cmd.getInputAssetCode());
        String fmt = cmd.getFormat() == null ? "srt" : cmd.getFormat().toLowerCase();
        boolean burn = Boolean.TRUE.equals(cmd.getBurnIn());

        // 1. 抽 wav
        String audioCode = "asset-" + UUID.randomUUID().toString().replace("-", "");
        Path audioPath = storage.allocateRenderOutput(audioCode, "wav");
        var ar = ffmpeg.runFfmpeg(List.of(
                "-y", "-i", video.toString(),
                "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le",
                audioPath.toString()
        ));
        if (!ar.ok()) return failResult(ar);

        // 2. ASR
        String langTag = "en".equalsIgnoreCase(cmd.getLang()) ? "en" : "zh";
        AsrAdapter.AsrResult res;
        try {
            res = asr.transcribe(audioPath, AsrAdapter.AsrOptions.builder().lang(langTag).wordTimestamp(false).build());
        } catch (Exception e) {
            return CmToolDtos.ToolResultDto.builder().status("FAILED").message("ASR 失败: " + e.getMessage()).build();
        }
        var segs = res.getSegments() == null ? new ArrayList<AsrAdapter.AsrResult.Segment>() : res.getSegments();
        if (segs.isEmpty()) return CmToolDtos.ToolResultDto.builder().status("FAILED").message("ASR 未识别到文字").build();

        // 3. 写 SRT/VTT
        List<String> outUrls = new ArrayList<>();
        Path srtPath = null;
        if (fmt.equals("srt") || fmt.equals("both")) {
            String srtCode = "asset-" + UUID.randomUUID().toString().replace("-", "");
            srtPath = storage.allocateRenderOutput(srtCode, "srt");
            Files.writeString(srtPath, buildSrt(segs));
            outUrls.add(storage.streamUrl(srtCode));
        }
        if (fmt.equals("vtt") || fmt.equals("both")) {
            String vttCode = "asset-" + UUID.randomUUID().toString().replace("-", "");
            Path vttPath = storage.allocateRenderOutput(vttCode, "vtt");
            Files.writeString(vttPath, buildVtt(segs));
            outUrls.add(storage.streamUrl(vttCode));
        }

        // 4. 可选硬烧到视频
        String videoUrl = null;
        if (burn) {
            if (srtPath == null) {
                String srtCode = "asset-" + UUID.randomUUID().toString().replace("-", "");
                srtPath = storage.allocateRenderOutput(srtCode, "srt");
                Files.writeString(srtPath, buildSrt(segs));
            }
            String outCode = "ren-" + UUID.randomUUID().toString().replace("-", "");
            Path output = storage.allocateRenderOutput(outCode, "mp4");
            // ffmpeg subtitles filter 需要转义路径
            String subPath = srtPath.toString().replace(":", "\\:").replace("'", "\\'");
            var br = ffmpeg.runFfmpeg(List.of(
                    "-y", "-i", video.toString(),
                    "-vf", "subtitles='" + subPath + "':force_style='Fontsize=22,PrimaryColour=&H00FFFFFF,Outline=1'",
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
                    "-c:a", "copy",
                    output.toString()
            ));
            if (!br.ok()) return failResult(br);
            videoUrl = storage.streamUrl(outCode);
            outUrls.add(0, videoUrl);
        }

        return CmToolDtos.ToolResultDto.builder()
                .status("SUCCEEDED")
                .streamUrl(videoUrl != null ? videoUrl : outUrls.get(0))
                .streamUrls(outUrls)
                .message("生成 " + segs.size() + " 行字幕" + (burn ? "（已硬烧）" : ""))
                .build();
    }

    private static String buildSrt(List<AsrAdapter.AsrResult.Segment> segs) {
        StringBuilder sb = new StringBuilder();
        int n = 0;
        for (var s : segs) {
            n++;
            sb.append(n).append('\n')
                    .append(srtTime(s.getStart())).append(" --> ").append(srtTime(s.getEnd())).append('\n')
                    .append(s.getText() == null ? "" : s.getText()).append("\n\n");
        }
        return sb.toString();
    }

    private static String buildVtt(List<AsrAdapter.AsrResult.Segment> segs) {
        StringBuilder sb = new StringBuilder("WEBVTT\n\n");
        for (var s : segs) {
            sb.append(vttTime(s.getStart())).append(" --> ").append(vttTime(s.getEnd())).append('\n')
                    .append(s.getText() == null ? "" : s.getText()).append("\n\n");
        }
        return sb.toString();
    }

    private static String srtTime(double sec) {
        int h = (int) (sec / 3600);
        int m = (int) ((sec % 3600) / 60);
        double rem = sec - h * 3600 - m * 60;
        int s = (int) rem;
        int ms = (int) Math.round((rem - s) * 1000);
        return String.format("%02d:%02d:%02d,%03d", h, m, s, ms);
    }

    private static String vttTime(double sec) {
        return srtTime(sec).replace(',', '.');
    }

    // ─── 8. 添加背景 ────────────────────────────────────────────────
    /** 把视频缩放后叠加在背景图/纯色上，输出指定尺寸 */
    public CmToolDtos.ToolResultDto addBg(CmToolDtos.AddBgCmd cmd) throws IOException, InterruptedException {
        Path video = require(cmd.getInputAssetCode());
        int outW = cmd.getOutWidth() != null ? evenize(cmd.getOutWidth()) : 1080;
        int outH = cmd.getOutHeight() != null ? evenize(cmd.getOutHeight()) : 1920;
        String mode = cmd.getScaleMode() == null ? "fit" : cmd.getScaleMode();
        double scaleRatio = cmd.getScaleRatio() != null ? cmd.getScaleRatio() : 0.7;
        scaleRatio = Math.max(0.1, Math.min(1.0, scaleRatio));
        String anchor = cmd.getAnchor() == null ? "center" : cmd.getAnchor();

        String outCode = "ren-" + UUID.randomUUID().toString().replace("-", "");
        Path output = storage.allocateRenderOutput(outCode, "mp4");

        // 计算视频在背景中的尺寸
        int videoMax = (int) (Math.min(outW, outH) * scaleRatio);
        videoMax = evenize(videoMax);

        String overlayY = switch (anchor) {
            case "top" -> "(H-h)/8";
            case "bottom" -> "H-h-(H-h)/8";
            default -> "(H-h)/2";
        };

        List<String> args = new ArrayList<>();
        args.add("-y");

        boolean useImage = cmd.getBgImageAssetCode() != null && !cmd.getBgImageAssetCode().isBlank();
        String filter;
        if (useImage) {
            Path bgImg = require(cmd.getBgImageAssetCode());
            args.add("-loop"); args.add("1"); args.add("-i"); args.add(bgImg.toString());
            args.add("-i"); args.add(video.toString());
            String vfMode = mode.equals("cover")
                    ? String.format("scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d", videoMax, videoMax, videoMax, videoMax)
                    : String.format("scale=%d:%d:force_original_aspect_ratio=decrease", videoMax, videoMax);
            filter = String.format(
                    "[0:v]scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d,setsar=1[bg];" +
                    "[1:v]%s,setsar=1[fg];" +
                    "[bg][fg]overlay=(W-w)/2:%s:shortest=1",
                    outW, outH, outW, outH, vfMode, overlayY);
        } else {
            String color = (cmd.getBgColor() == null || cmd.getBgColor().isBlank()) ? "#000000" : cmd.getBgColor();
            args.add("-f"); args.add("lavfi");
            args.add("-i"); args.add(String.format("color=c=%s:s=%dx%d:d=3600", color.replace("#", "0x"), outW, outH));
            args.add("-i"); args.add(video.toString());
            String vfMode = mode.equals("cover")
                    ? String.format("scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d", videoMax, videoMax, videoMax, videoMax)
                    : String.format("scale=%d:%d:force_original_aspect_ratio=decrease", videoMax, videoMax);
            filter = String.format(
                    "[1:v]%s,setsar=1[fg];" +
                    "[0:v][fg]overlay=(W-w)/2:%s:shortest=1",
                    vfMode, overlayY);
        }
        args.add("-filter_complex"); args.add(filter);
        args.add("-map"); args.add("1:a?");  // 复制原视频音频
        args.add("-c:v"); args.add("libx264"); args.add("-preset"); args.add("veryfast"); args.add("-crf"); args.add("23");
        args.add("-c:a"); args.add("aac"); args.add("-b:a"); args.add("128k");
        args.add("-shortest");
        args.add(output.toString());

        var r = ffmpeg.runFfmpeg(args);
        return finishSingle(r, outCode, output);
    }

    // ─── 9. 裂变文字样式 ────────────────────────────────────────────
    /** 在视频上叠加 N 种文字版本（不同字体颜色 / 描边 / 阴影），生成 N 个独立 mp4 */
    public CmToolDtos.ToolResultDto textStyleFission(CmToolDtos.TextStyleFissionCmd cmd) throws IOException, InterruptedException {
        Path video = require(cmd.getInputAssetCode());
        String text = cmd.getText() == null ? "示例文字" : cmd.getText();
        int count = cmd.getCount() != null ? Math.max(1, Math.min(8, cmd.getCount())) : 4;
        int fs = cmd.getFontSize() != null ? cmd.getFontSize() : 64;
        double xPct = cmd.getXPct() != null ? cmd.getXPct() : 50;
        double yPct = cmd.getYPct() != null ? cmd.getYPct() : 80;
        String preset = cmd.getStylePreset() == null ? "default" : cmd.getStylePreset();

        // N 套调色板：基础色由 fontColor 起，循环偏移 hue 生成更多版本
        String[] palette = textStylePalette(cmd.getFontColor(), cmd.getBorderColor(), preset, count);

        // ffmpeg drawtext 转义
        String safeText = text.replace("\\", "\\\\").replace("'", "\\'").replace(":", "\\:");

        List<String> resultCodes = new ArrayList<>();
        List<String> resultUrls = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            String[] colors = palette[i].split("\\|");  // fontColor|borderColor
            String fontColor = colors[0];
            String borderColor = colors.length > 1 ? colors[1] : "#000000";

            String outCode = "ren-" + UUID.randomUUID().toString().replace("-", "");
            Path output = storage.allocateRenderOutput(outCode, "mp4");

            String drawtext = String.format(
                    "drawtext=text='%s':fontsize=%d:fontcolor=%s:bordercolor=%s:borderw=%d:" +
                    "x=(w*%.2f-text_w/2):y=(h*%.2f-text_h/2):shadowcolor=black@0.5:shadowx=2:shadowy=2",
                    safeText, fs,
                    fontColor.replace("#", "0x"),
                    borderColor.replace("#", "0x"),
                    "shock".equals(preset) ? 5 : 2,
                    xPct / 100.0, yPct / 100.0);

            var r = ffmpeg.runFfmpeg(List.of(
                    "-y", "-i", video.toString(),
                    "-vf", drawtext,
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
                    "-c:a", "copy",
                    output.toString()
            ));
            if (!r.ok()) {
                log.warn("[textStyleFission] {} failed: exit={}", outCode, r.exitCode());
                continue;
            }
            resultCodes.add(outCode);
            resultUrls.add(storage.streamUrl(outCode));
        }

        if (resultUrls.isEmpty()) {
            return CmToolDtos.ToolResultDto.builder()
                    .status("FAILED").message("所有版本生成失败（多半是字体路径问题）").build();
        }
        return CmToolDtos.ToolResultDto.builder()
                .status("SUCCEEDED")
                .resultAssetCodes(resultCodes)
                .streamUrls(resultUrls)
                .streamUrl(resultUrls.get(0))
                .message("已生成 " + resultUrls.size() + " 种文字样式")
                .build();
    }

    /** 简单调色板：根据 preset 给出不同颜色组合（fontColor|borderColor） */
    private static String[] textStylePalette(String baseFont, String baseBorder, String preset, int n) {
        String f = baseFont == null ? "#FFFFFF" : baseFont;
        String b = baseBorder == null ? "#000000" : baseBorder;
        List<String> presets = switch (preset) {
            case "shock" -> List.of("#FFFFFF|#FF0033", "#FFEB3B|#000000", "#FF1744|#FFFFFF", "#FFFFFF|#000000",
                                    "#00E5FF|#000000", "#FF4081|#FFFFFF", "#76FF03|#000000", "#FFD600|#212121");
            case "cute"  -> List.of("#FFB7C5|#FFFFFF", "#FFEB3B|#FF80AB", "#FFFFFF|#FFB7C5", "#FFC0CB|#7C4DFF",
                                    "#FFFFFF|#9C27B0", "#FFD180|#FFFFFF", "#FF80AB|#FFFFFF", "#FFCCBC|#FF5722");
            case "business" -> List.of("#FFFFFF|#0D47A1", "#FFFFFF|#1B5E20", "#212121|#FFFFFF", "#FFFFFF|#3E2723",
                                    "#FFFFFF|#263238", "#FAFAFA|#37474F", "#212121|#CFD8DC", "#FFFFFF|#004D40");
            default -> List.of(f + "|" + b, "#FFEB3B|#000000", "#FF1744|#FFFFFF", "#00E5FF|#000000",
                               "#FFFFFF|#FF0033", "#76FF03|#000000", "#FFFFFF|#1B5E20", "#FFD600|#212121");
        };
        String[] out = new String[n];
        for (int i = 0; i < n; i++) out[i] = presets.get(i % presets.size());
        return out;
    }
}
