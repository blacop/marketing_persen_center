package com.beukay.marketing.person.app.cutmatrix.semantic;

import com.beukay.marketing.person.app.cutmatrix.linkingest.asr.AsrAdapter;
import com.beukay.marketing.person.app.cutmatrix.llm.LlmAdapter;
import com.beukay.marketing.person.app.cutmatrix.runtime.CmAssetStorageService;
import com.beukay.marketing.person.app.cutmatrix.runtime.CmFFmpegRunner;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import com.beukay.ai.common.exception.GenericBusinessException;
/**
 * 按语义拆解：
 *   1. ffmpeg 抽音
 *   2. ASR 转写带时间戳
 *   3. LLM 把 ASR 段落聚合成"语义片段" + 命中目标文件夹
 *   4. 返回 segments[]
 *
 * 导出：
 *   - 按 segments[] 用 ffmpeg 切片
 *   - 生成简化的剪映 (JianYing) 工程文件 JSON
 *   - 打成 zip 包，按文件夹分目录
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class CmSemanticSplitService {

    private final CmAssetStorageService storage;
    private final CmFFmpegRunner ffmpeg;
    private final AsrAdapter asr;
    private final LlmAdapter llm;

    private static final ObjectMapper JSON = new ObjectMapper();

    private static final String LLM_SYSTEM = """
            你是短视频内容拆解专家。把口播音频按"独立卖点 / 独立话题"切成精细片段，每片段对应一个独立画面镜头。
            严格 JSON 输出，不输出 markdown 包裹。
            """;

    public CmSemanticSplitDtos.SplitResult split(CmSemanticSplitDtos.SplitCmd cmd) {
        long start = System.currentTimeMillis();
        try {
            Path video = storage.resolveAssetByCode(cmd.getInputAssetCode());
            if (video == null) throw new GenericBusinessException("assetCode 不存在: " + cmd.getInputAssetCode());

            // 1. ffmpeg 抽 wav 16k mono
            String audioCode = "asset-" + UUID.randomUUID().toString().replace("-", "");
            Path audioPath = storage.allocateRenderOutput(audioCode, "wav");
            CmFFmpegRunner.Result r = ffmpeg.runFfmpeg(List.of(
                    "-y", "-i", video.toString(),
                    "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le",
                    audioPath.toString()
            ));
            if (!r.ok()) throw new GenericBusinessException("ffmpeg 抽音失败：exit=" + r.exitCode());

            double totalDur;
            try { totalDur = ffmpeg.probe(video).durationSec(); } catch (Exception e) { totalDur = 0; }

            // 模式时长校验
            String mode = cmd.getMode() == null ? "short" : cmd.getMode();
            if ("live".equals(mode)) {
                if (totalDur < 30 || totalDur > 5 * 3600) {
                    return failed("直播切片要求时长 30s-5h，当前 " + String.format("%.1f", totalDur) + "s", start);
                }
            } else {
                if (totalDur < 1 || totalDur > 3600) {
                    return failed("短视频精细化要求时长 1s-1h，当前 " + String.format("%.1f", totalDur) + "s", start);
                }
            }

            // 2. ASR
            AsrAdapter.AsrResult asrResult = asr.transcribe(audioPath, AsrAdapter.AsrOptions.builder()
                    .lang("zh").wordTimestamp(false).build());

            List<AsrAdapter.AsrResult.Segment> asrSegs = asrResult.getSegments() == null ? new ArrayList<>() : asrResult.getSegments();
            if (asrSegs.isEmpty()) {
                return failed("ASR 未识别到任何句子", start);
            }

            // 3. LLM 聚合 ASR 片段为语义片段 + 匹配文件夹
            List<CmSemanticSplitDtos.SplitResult.Segment> segs = mergeAndMatch(asrSegs, cmd.getFolders(), mode);

            return CmSemanticSplitDtos.SplitResult.builder()
                    .status("SUCCEEDED")
                    .segments(segs)
                    .durationSec(totalDur)
                    .provider(asr.getClass().getSimpleName() + " + " + llm.getClass().getSimpleName())
                    .elapsedMs(System.currentTimeMillis() - start)
                    .build();
        } catch (Exception e) {
            log.error("[SemanticSplit] failed", e);
            return failed(e.getMessage() == null ? "处理失败" : e.getMessage(), start);
        }
    }

    /** 让 LLM 把 ASR 句子合并成语义片段，每条匹配最相关文件夹 */
    private List<CmSemanticSplitDtos.SplitResult.Segment> mergeAndMatch(
            List<AsrAdapter.AsrResult.Segment> asrSegs,
            List<CmSemanticSplitDtos.SplitCmd.TargetFolder> folders,
            String mode) {
        // 构造给 LLM 的输入：编号 + 时间戳 + 文本
        StringBuilder input = new StringBuilder();
        for (int i = 0; i < asrSegs.size(); i++) {
            AsrAdapter.AsrResult.Segment a = asrSegs.get(i);
            input.append(String.format("[%d] %.2f-%.2fs: %s%n", i + 1, a.getStart(), a.getEnd(), a.getText()));
        }

        StringBuilder folderList = new StringBuilder();
        if (folders != null && !folders.isEmpty()) {
            folderList.append("可选目标文件夹（按 id 引用）：\n");
            for (var f : folders) {
                folderList.append(String.format("- id=%s name=\"%s\"%s%n",
                        f.getId(), f.getName(),
                        f.getKeywords() != null && !f.getKeywords().isBlank() ? " keywords=" + f.getKeywords() : ""));
            }
        } else {
            folderList.append("无目标文件夹，请只切片不分类（folderId 留空字符串）。\n");
        }

        String userPrompt = """
                以下是 ASR 转写的逐句口播文本。

                任务：
                1. 把相邻的句子按"独立卖点/独立话题"合并成更粗粒度的语义片段（一个片段对应一个独立画面镜头）。
                2. %s
                3. 严格按时间顺序输出，不调换、不省略。

                %s

                逐句文本：
                %s

                严格 JSON 输出：
                {"segments":[{"start":数字,"end":数字,"text":"...","folderId":"...","confidence":0-1}]}
                没有合适匹配的文件夹时，folderId 留空字符串，confidence 为 0。
                """.formatted(
                "live".equals(mode)
                        ? "尽量切粗一些（每片段 30-180s），适合直播长视频"
                        : "切细些（每片段 5-30s），适合短视频精细镜头",
                folderList.toString(),
                input.toString());

        try {
            String resp = llm.chat(LLM_SYSTEM, userPrompt,
                    LlmAdapter.ChatOptions.builder()
                            .temperature(0.2).maxTokens(3500).responseFormat("json").build());
            return parseLlmSegments(resp, folders);
        } catch (Exception e) {
            log.warn("[SemanticSplit] LLM 失败，按原 ASR 片段返回：{}", e.getMessage());
            // 兜底：用 ASR 原片段，不分类
            List<CmSemanticSplitDtos.SplitResult.Segment> out = new ArrayList<>();
            for (int i = 0; i < asrSegs.size(); i++) {
                AsrAdapter.AsrResult.Segment a = asrSegs.get(i);
                out.add(CmSemanticSplitDtos.SplitResult.Segment.builder()
                        .idx(i + 1)
                        .start(a.getStart()).end(a.getEnd()).text(a.getText())
                        .folderId("").folderName("").confidence(0.0)
                        .build());
            }
            return out;
        }
    }

    private static List<CmSemanticSplitDtos.SplitResult.Segment> parseLlmSegments(
            String raw, List<CmSemanticSplitDtos.SplitCmd.TargetFolder> folders) {
        List<CmSemanticSplitDtos.SplitResult.Segment> out = new ArrayList<>();
        if (raw == null) return out;
        String s = raw.trim();
        if (s.startsWith("```")) {
            int nl = s.indexOf('\n');
            if (nl > 0) s = s.substring(nl + 1);
            if (s.endsWith("```")) s = s.substring(0, s.length() - 3).trim();
        }
        int lb = s.indexOf('{'), rb = s.lastIndexOf('}');
        if (lb >= 0 && rb > lb) s = s.substring(lb, rb + 1);

        // 文件夹 id → name 映射
        java.util.Map<String, String> nameMap = new java.util.HashMap<>();
        if (folders != null) for (var f : folders) nameMap.put(f.getId(), f.getName());

        try {
            JsonNode root = JSON.readTree(s);
            JsonNode arr = root.path("segments");
            int idx = 0;
            if (arr.isArray()) {
                for (JsonNode item : arr) {
                    idx++;
                    String fid = item.path("folderId").asText("");
                    out.add(CmSemanticSplitDtos.SplitResult.Segment.builder()
                            .idx(idx)
                            .start(item.path("start").asDouble(0))
                            .end(item.path("end").asDouble(0))
                            .text(item.path("text").asText(""))
                            .folderId(fid)
                            .folderName(nameMap.getOrDefault(fid, ""))
                            .confidence(item.path("confidence").asDouble(0))
                            .build());
                }
            }
        } catch (Exception e) {
            log.warn("[SemanticSplit] parse LLM JSON failed: {}", e.getMessage());
        }
        return out;
    }

    // ─── 导出 ────────────────────────────────────────────────────────────────

    public CmSemanticSplitDtos.ExportResult export(CmSemanticSplitDtos.ExportCmd cmd) {
        try {
            Path video = storage.resolveAssetByCode(cmd.getInputAssetCode());
            if (video == null) throw new GenericBusinessException("assetCode 不存在");
            List<CmSemanticSplitDtos.SplitResult.Segment> segs = cmd.getSegments() == null
                    ? new ArrayList<>() : cmd.getSegments();
            if (segs.isEmpty()) {
                return CmSemanticSplitDtos.ExportResult.builder()
                        .status("FAILED").errMsg("无 segments 可导出").build();
            }
            String format = cmd.getFormat() == null ? "both" : cmd.getFormat();

            // folder 名称查找
            java.util.Map<String, String> folderNameMap = new java.util.HashMap<>();
            if (cmd.getFolders() != null) for (var f : cmd.getFolders()) folderNameMap.put(f.getId(), f.getName());

            // 1. 切片
            List<CmSemanticSplitDtos.ExportResult.ClipFile> clips = new ArrayList<>();
            String batchCode = "batch-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            Path batchDir = storage.allocateTempDir(batchCode);

            for (var seg : segs) {
                if (seg.getStart() == null || seg.getEnd() == null || seg.getEnd() <= seg.getStart()) continue;
                double dur = seg.getEnd() - seg.getStart();
                String folderName = sanitizeFileName(
                        seg.getFolderName() != null && !seg.getFolderName().isBlank()
                                ? seg.getFolderName()
                                : folderNameMap.getOrDefault(seg.getFolderId(), "未分配"));
                Path subDir = batchDir.resolve(folderName);
                Files.createDirectories(subDir);
                String clipName = String.format("%03d-%s.mp4", seg.getIdx(),
                        sanitizeFileName(seg.getText() == null ? "" : seg.getText().substring(0, Math.min(seg.getText().length(), 12))));
                Path clipPath = subDir.resolve(clipName);
                CmFFmpegRunner.Result r = ffmpeg.runFfmpeg(List.of(
                        "-y", "-ss", String.format("%.3f", seg.getStart()),
                        "-i", video.toString(),
                        "-t", String.format("%.3f", dur),
                        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
                        "-c:a", "aac", "-b:a", "128k",
                        clipPath.toString()
                ));
                if (!r.ok()) {
                    log.warn("[SemanticSplit/export] clip {} failed: exit={}", seg.getIdx(), r.exitCode());
                    continue;
                }
                clips.add(CmSemanticSplitDtos.ExportResult.ClipFile.builder()
                        .idx(seg.getIdx())
                        .folderName(folderName)
                        .fileName(clipName)
                        .durationSec(dur)
                        .build());
            }

            // 2. 生成剪映工程文件（简化版 draft_content.json）
            String draftJson = buildJianyingDraft(segs, video.getFileName().toString());
            Path draftPath = batchDir.resolve("jianying.draft.json");
            Files.writeString(draftPath, draftJson);

            // 3. 打 zip
            String zipCode = "asset-" + UUID.randomUUID().toString().replace("-", "");
            Path zipPath = storage.allocateRenderOutput(zipCode, "zip");
            try (var out = new ZipOutputStream(Files.newOutputStream(zipPath))) {
                Files.walk(batchDir).filter(Files::isRegularFile).forEach(p -> {
                    try {
                        String entry = batchDir.relativize(p).toString().replace('\\', '/');
                        out.putNextEntry(new ZipEntry(entry));
                        Files.copy(p, out);
                        out.closeEntry();
                    } catch (Exception e) {
                        log.warn("[zip] add {} failed: {}", p, e.getMessage());
                    }
                });
            }

            log.info("[SemanticSplit/export] {} clips → zip {}", clips.size(), zipPath);
            String zipUrl = storage.streamUrl(zipCode);

            return CmSemanticSplitDtos.ExportResult.builder()
                    .status("SUCCEEDED")
                    .zipUrl(zipUrl)
                    .clips(clips)
                    .jianyingDraftUrl(zipUrl + "#jianying.draft.json")
                    .build();
        } catch (Exception e) {
            log.error("[SemanticSplit/export] failed", e);
            return CmSemanticSplitDtos.ExportResult.builder()
                    .status("FAILED").errMsg(e.getMessage()).build();
        }
    }

    /** 简化版剪映 draft：material + track + segment 三层结构 */
    private static String buildJianyingDraft(List<CmSemanticSplitDtos.SplitResult.Segment> segs, String sourceVideo) throws Exception {
        ObjectNode root = JSON.createObjectNode();
        root.put("schema_version", "1.0");
        root.put("source_video", sourceVideo);
        root.put("created_at", java.time.Instant.now().toString());

        // materials
        ArrayNode materials = root.putArray("materials");
        ObjectNode mat = materials.addObject();
        mat.put("id", "video_001");
        mat.put("type", "video");
        mat.put("path", sourceVideo);

        // tracks
        ArrayNode tracks = root.putArray("tracks");
        ObjectNode track = tracks.addObject();
        track.put("id", "track_video_001");
        track.put("type", "video");

        ArrayNode trackSegs = track.putArray("segments");
        for (var s : segs) {
            if (s.getStart() == null || s.getEnd() == null) continue;
            ObjectNode item = trackSegs.addObject();
            item.put("id", "seg_" + s.getIdx());
            item.put("material_id", "video_001");
            item.put("source_start_ms", (long) (s.getStart() * 1000));
            item.put("source_end_ms", (long) (s.getEnd() * 1000));
            item.put("duration_ms", (long) ((s.getEnd() - s.getStart()) * 1000));
            item.put("text", s.getText());
            if (s.getFolderName() != null) item.put("category", s.getFolderName());
        }

        return JSON.writerWithDefaultPrettyPrinter().writeValueAsString(root);
    }

    private static String sanitizeFileName(String s) {
        if (s == null || s.isEmpty()) return "untitled";
        return s.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
    }

    private static CmSemanticSplitDtos.SplitResult failed(String msg, long start) {
        return CmSemanticSplitDtos.SplitResult.builder()
                .status("FAILED").errMsg(msg)
                .elapsedMs(System.currentTimeMillis() - start).build();
    }
}
