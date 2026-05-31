package com.beukay.marketing.person.infrastructure.composition.asr;

import com.beukay.marketing.person.domain.composition.ability.MaterialFolderService;
import com.beukay.marketing.person.domain.composition.model.MaterialFolder;
import com.beukay.marketing.person.domain.composition.model.SourceVideo;
import com.beukay.marketing.person.infrastructure.composition.render.CompositionRenderProperties;
import com.beukay.marketing.person.infrastructure.composition.render.FfmpegRunner;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 自动拆解（多模态视频理解模式）：
 *  1. ffmpeg 把源视频压缩到低分辨率/低码率（控制 base64 后 ≤ 10MB）
 *  2. 长视频按配置切块（默认 4 分钟）
 *  3. 每块 base64 → 调 qwen3-omni-flash 多模态接口
 *  4. prompt 给当前 folders 列表 + 输出 JSON 格式约定
 *  5. 解析 segments，时间戳叠加块偏移合并
 *
 *  好处：模型直接看视频画面 + 听音频 + 看文本，能基于"产品出现/妆效展示/口播"等
 *  视觉语义直接拆段并归类，不再依赖 silencedetect + 标点拆分。
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class AutoSplitOrchestrator {

    private static final String LOCAL_SCHEME = "local://";

    private final DashScopeOmniClient omniClient;
    private final MaterialFolderService folderService;
    private final FfmpegRunner ffmpegRunner;
    private final CompositionRenderProperties renderProps;
    private final DashScopeProperties dashscope;
    private final ObjectMapper objectMapper;

    public List<SourceVideo.Segment> autoSplit(SourceVideo source) throws IOException, InterruptedException {
        Path videoPath = resolveLocalPath(source.getOssKey());
        Path workspace = Paths.get(renderProps.getWorkspaceDir(), "omni", String.valueOf(source.getId()));
        Files.createDirectories(workspace);

        List<MaterialFolder> folders = folderService.listAll();
        if (folders.isEmpty()) {
            throw new IllegalStateException("还没有目标文件夹，请先在右侧创建/上传文件夹再做自动拆解");
        }

        long totalDurMs = source.getDurationMs() == null ? 0L : source.getDurationMs();
        if (totalDurMs <= 0) {
            throw new IllegalStateException("无法获取视频时长，请删除并重新上传源视频");
        }
        long chunkMs = (long) dashscope.getVideoChunkSeconds() * 1000;

        List<SourceVideo.Segment> all = new ArrayList<>();
        long offsetMs = 0;
        int chunkIdx = 0;

        while (offsetMs < totalDurMs) {
            chunkIdx++;
            long startMs = offsetMs;
            long endMs = Math.min(totalDurMs, offsetMs + chunkMs);

            // 1. 压缩 + 切块
            Path chunk = workspace.resolve("chunk_" + chunkIdx + ".mp4");
            compressAndCut(videoPath, chunk, startMs, endMs - startMs, workspace);
            long sizeKB = Files.size(chunk) / 1024;
            log.info("[omni] chunk{} [{}-{}ms] {}KB", chunkIdx, startMs, endMs, sizeKB);
            if (sizeKB == 0) {
                offsetMs = endMs;
                continue;
            }

            // 2. 调 omni 模型
            String prompt = buildPrompt(folders, endMs - startMs);
            String reply;
            try {
                reply = omniClient.analyzeVideo(chunk, prompt);
            } catch (Exception e) {
                log.error("[omni] chunk{} failed: {}", chunkIdx, e.getMessage());
                try { Files.deleteIfExists(chunk); } catch (IOException ignored) {}
                throw new IOException("多模态调用失败：" + e.getMessage(), e);
            }
            log.info("[omni] chunk{} reply (first 600): {}", chunkIdx,
                    reply.length() > 600 ? reply.substring(0, 600) + "..." : reply);

            // 3. 解析 + 时间戳偏移
            List<SourceVideo.Segment> segs = parseSegments(reply, folders, startMs, endMs);
            log.info("[omni] chunk{} parsed {} segments", chunkIdx, segs.size());
            all.addAll(segs);

            try { Files.deleteIfExists(chunk); } catch (IOException ignored) {}

            offsetMs = endMs;
        }

        // 按时间戳排序
        all.sort((a, b) -> Long.compare(a.getStartMs(), b.getStartMs()));
        return all;
    }

    /** ffmpeg 压视频 + 切块到指定时间区间（控制 base64 后 ≤ 10MB） */
    private void compressAndCut(Path src, Path out, long startMs, long durMs, Path workspace) {
        double startSec = startMs / 1000.0;
        double durSec = durMs / 1000.0;
        ffmpegRunner.exec(List.of(
                "-y",
                "-ss", String.format("%.3f", startSec),
                "-i", src.toString(),
                "-t", String.format("%.3f", durSec),
                "-vf", "scale=" + dashscope.getVideoCompressWidth() + ":-2",
                "-r", "15",
                "-c:v", "libx264",
                "-preset", "veryfast",
                "-b:v", dashscope.getVideoCompressBitrateKbps() + "k",
                "-pix_fmt", "yuv420p",
                "-c:a", "aac",
                "-b:a", "48k",
                "-ac", "1",
                "-ar", "16000",
                "-movflags", "+faststart",
                out.toString()
        ), workspace);
    }

    private String buildPrompt(List<MaterialFolder> folders, long chunkDurMs) {
        StringBuilder catList = new StringBuilder();
        for (MaterialFolder f : folders) {
            catList.append("- ").append(f.getCode());
            if (f.getDescription() != null && !f.getDescription().isBlank()) {
                catList.append("：").append(f.getDescription());
            }
            catList.append("\n");
        }
        StringBuilder validList = new StringBuilder();
        boolean first = true;
        for (MaterialFolder f : folders) {
            if (!first) validList.append(" | ");
            validList.append("\"").append(f.getCode()).append("\"");
            first = false;
        }

        long durSec = chunkDurMs / 1000;

        return "你是一名美妆短视频剪辑师。请仔细看这段视频（含画面 + 配音）并按内容拆成连贯的「卖点片段」并归类。\n\n" +
                "可选分类：\n" + catList + "\n" +
                "category 字段必须**精确等于**下面这些字符串之一（不能加引号、方括号、序号等任何修饰）：\n" +
                validList + "\n\n" +
                "输出严格 JSON 数组（不要 Markdown 代码块、不要解释、不要其他文字）：\n" +
                "[\n" +
                "  {\"startMs\": 0, \"endMs\": 3500, \"category\": \"<上面合法值之一>\", \"name\": \"悬念开场\", \"memo\": \"该片段一句话摘要\"},\n" +
                "  ...\n" +
                "]\n\n" +
                "规则：\n" +
                "- startMs/endMs 单位是毫秒，相对该视频片段的开始（即 0 对应视频起点）\n" +
                "- 视频总长约 " + durSec + " 秒（" + chunkDurMs + " ms），endMs 不能超过这个数\n" +
                "- startMs >= 0，endMs > startMs\n" +
                "- 各片段时间戳要按时间顺序排列、可以有空隙、不要重叠\n" +
                "- name 是 8 字以内中文短标题（描述这段内容）\n" +
                "- memo 是该段画面/文本一句话摘要 30 字以内\n" +
                "- 总片段数 3-15 个，每段 2-30 秒为宜，根据视频实际内容判断\n" +
                "- 务必让连续画面/语义紧密的内容归到同一片段，不要切得太碎";
    }

    private List<SourceVideo.Segment> parseSegments(String reply, List<MaterialFolder> folders,
                                                     long offsetMs, long endLimitMs) {
        Set<String> validCodes = new HashSet<>();
        for (MaterialFolder f : folders) validCodes.add(f.getCode());

        String json = reply == null ? "" : reply.trim();
        if (json.startsWith("```")) {
            int firstNl = json.indexOf('\n');
            if (firstNl > 0) json = json.substring(firstNl + 1);
            int lastFence = json.lastIndexOf("```");
            if (lastFence > 0) json = json.substring(0, lastFence);
        }
        json = json.trim();

        List<SourceVideo.Segment> out = new ArrayList<>();
        try {
            JsonNode arr = objectMapper.readTree(json);
            if (!arr.isArray()) {
                log.warn("[omni] reply is not array: {}", truncate(reply, 300));
                return out;
            }
            for (JsonNode n : arr) {
                long localStart = n.path("startMs").asLong(-1);
                long localEnd = n.path("endMs").asLong(-1);
                String cat = unwrapCategory(n.path("category").asText("").trim());
                String name = n.path("name").asText("").trim();
                String memo = n.path("memo").asText("").trim();
                if (localStart < 0 || localEnd <= localStart) continue;

                long absStart = offsetMs + localStart;
                long absEnd = offsetMs + Math.min(localEnd, endLimitMs - offsetMs);
                if (absEnd <= absStart) continue;

                String finalCat = cat;
                if (cat.isBlank() || !validCodes.contains(cat)) {
                    log.warn("[omni] skip seg with invalid category: {} (name={})", cat, name);
                    finalCat = null; // 保留段但 category 留空，让用户手动归
                }
                out.add(SourceVideo.Segment.builder()
                        .startMs(absStart).endMs(absEnd)
                        .category(finalCat)
                        .name(name.isBlank() ? "片段" : name)
                        .memo(memo.isBlank() ? null : memo)
                        .build());
            }
        } catch (Exception e) {
            log.error("[omni] parse json failed: {}", e.getMessage());
        }
        return out;
    }

    private static String unwrapCategory(String s) {
        String x = s == null ? "" : s.trim();
        while (x.length() > 1 && (x.startsWith("\"") || x.startsWith("'") || x.startsWith("「"))
                && (x.endsWith("\"") || x.endsWith("'") || x.endsWith("」"))) {
            x = x.substring(1, x.length() - 1).trim();
        }
        if (x.startsWith("[code:") && x.endsWith("]")) {
            x = x.substring("[code:".length(), x.length() - 1).trim();
            while (x.length() > 1 && x.startsWith("\"") && x.endsWith("\"")) {
                x = x.substring(1, x.length() - 1).trim();
            }
        }
        return x;
    }

    private static Path resolveLocalPath(String ossKey) {
        if (ossKey == null || !ossKey.startsWith(LOCAL_SCHEME)) {
            throw new IllegalStateException("source video must be local://, got: " + ossKey);
        }
        return Paths.get(ossKey.substring(LOCAL_SCHEME.length()));
    }

    private static String truncate(String s, int max) {
        return s == null ? "" : s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
