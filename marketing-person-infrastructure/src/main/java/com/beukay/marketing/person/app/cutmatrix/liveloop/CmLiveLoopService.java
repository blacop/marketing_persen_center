package com.beukay.marketing.person.app.cutmatrix.liveloop;

import com.beukay.marketing.person.app.cutmatrix.linkingest.asr.AsrAdapter;
import com.beukay.marketing.person.app.cutmatrix.llm.LlmAdapter;
import com.beukay.marketing.person.app.cutmatrix.runtime.CmAssetStorageService;
import com.beukay.marketing.person.app.cutmatrix.runtime.CmFFmpegRunner;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import com.beukay.ai.common.exception.GenericBusinessException;
/**
 * 拆解电商直播话术循环：
 *   1. ffmpeg 抽 wav
 *   2. ASR 拿到逐句带时间戳
 *   3. LLM 把句子聚合成"话术循环"——每一轮欢迎/介绍/卖点/收单为一个 loop
 *   4. LLM 同时标注每条句子是否为黄金卖点 / 钩子话术 (isHighlight)
 *   5. 用户勾选 loop 后批量切片导出（每个 loop 一个 mp4，按产品名分目录）
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class CmLiveLoopService {

    private final CmAssetStorageService storage;
    private final CmFFmpegRunner ffmpeg;
    private final AsrAdapter asr;
    private final LlmAdapter llm;

    private static final ObjectMapper JSON = new ObjectMapper();

    private static final String LLM_SYSTEM = """
            你是电商直播话术循环检测专家。

            核心定义：
              "话术循环" = 达人对同一产品/同一卖点开始【重复讲解】的边界。
              【新循环只在"前一大段与后一大段语义大意基本一致 / 重复"时切分】。
              如果后段内容是新信息、补充细节、答疑、过渡，则属于同一循环，不切。

            判定规则：
              - 关键词：欢迎新进来的 / 我再给大家讲一下 / 没看到的宝宝 / 我重复一遍 / 再来看一下这款
                + 后续内容与前文大意一致 → 切新循环
              - 仅有"欢迎"开场词但内容继续推进/不重复 → 不切
              - 推进式讲解（介绍→演示→上脸→对比→收单）只要内容不重复，全部归一个循环
              - 同一商品反复讲 N 遍 = N 个循环；商品换了但只讲 1 遍 = 仍 1 个循环

            严格 JSON 输出，不输出 markdown 包裹。
            """;

    public CmLiveLoopDtos.DetectResult detect(CmLiveLoopDtos.DetectCmd cmd) {
        long start = System.currentTimeMillis();
        try {
            Path video = storage.resolveAssetByCode(cmd.getInputAssetCode());
            if (video == null) throw new GenericBusinessException("assetCode 不存在: " + cmd.getInputAssetCode());

            // 1. ffmpeg 抽音
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

            if (totalDur < 60) {
                return failed("直播切片要求时长 >= 60s，当前 " + String.format("%.1f", totalDur) + "s", start);
            }

            // 2. ASR
            AsrAdapter.AsrResult asrResult = asr.transcribe(audioPath, AsrAdapter.AsrOptions.builder()
                    .lang("zh").wordTimestamp(false).build());
            List<AsrAdapter.AsrResult.Segment> asrSegs = asrResult.getSegments() == null ? new ArrayList<>() : asrResult.getSegments();
            if (asrSegs.isEmpty()) return failed("ASR 未识别到任何句子", start);

            // 3. LLM 聚合循环
            double minLoopSec = cmd.getMinLoopSec() == null ? 30.0 : cmd.getMinLoopSec();
            List<CmLiveLoopDtos.Loop> loops = aggregateLoops(asrSegs, minLoopSec);

            return CmLiveLoopDtos.DetectResult.builder()
                    .status("SUCCEEDED")
                    .loops(loops)
                    .durationSec(totalDur)
                    .provider(asr.getClass().getSimpleName() + " + " + llm.getClass().getSimpleName())
                    .elapsedMs(System.currentTimeMillis() - start)
                    .build();
        } catch (Exception e) {
            log.error("[LiveLoop/detect] failed", e);
            return failed(e.getMessage() == null ? "处理失败" : e.getMessage(), start);
        }
    }

    /** LLM 把 ASR 句子聚合为话术循环 */
    private List<CmLiveLoopDtos.Loop> aggregateLoops(
            List<AsrAdapter.AsrResult.Segment> asrSegs, double minLoopSec) {

        StringBuilder input = new StringBuilder();
        for (int i = 0; i < asrSegs.size(); i++) {
            AsrAdapter.AsrResult.Segment a = asrSegs.get(i);
            input.append(String.format("[%d] %.2f-%.2fs: %s%n", i + 1, a.getStart(), a.getEnd(), a.getText()));
        }

        String userPrompt = """
                以下是直播录像的 ASR 逐句转写。

                第一步【关键】：识别"话术循环"切分点
                  - 切分点的唯一判据：达人开始把【已经讲过的内容】重新再讲一遍（语义大意基本一致，哪怕用词换了）。
                  - 不是"重复"就【不切】。无论时长多长，介绍/演示/卖点/答疑/福利只要内容在向前推进，全部留在同一循环。
                  - 重复信号举例：再次介绍同一产品名 + 同一核心卖点；再次报同一价格；再次讲同一上妆/试用步骤。
                  - 仅有"欢迎新进来的宝宝"等开场词、不带后续重复内容 → 不切。

                第二步：对每个循环
                  - 保留所有原句（按时间顺序，不删句）。
                  - "黄金卖点 / 钩子话术 / 价格福利 / 演示要点" 句标记 isHighlight=true。
                  - 推断 productName（该循环主讲的产品；多个产品取最主要的那个）。
                  - 提取 1-3 个 keywords（卖点词 / 产品词）。

                约束：
                  - 单个循环时长不少于 %.0f 秒；过短不要切。
                  - 如果整段视频【没有任何重复】，输出仅 1 个循环。
                  - 严格按 ASR 时间顺序，不调换、不省略。

                逐句文本：
                %s

                严格 JSON 输出：
                {"loops":[{"productName":"...","start":数字,"end":数字,"keywords":["...","..."],"sentences":[{"start":数字,"end":数字,"text":"...","isHighlight":true|false}]}]}
                """.formatted(minLoopSec, input.toString());

        try {
            String resp = llm.chat(LLM_SYSTEM, userPrompt,
                    LlmAdapter.ChatOptions.builder()
                            .temperature(0.2).maxTokens(6000).responseFormat("json").build());
            return parseLlmLoops(resp);
        } catch (Exception e) {
            log.warn("[LiveLoop] LLM 失败，按等长切分兜底：{}", e.getMessage());
            return fallbackEqualSplit(asrSegs, minLoopSec);
        }
    }

    private static List<CmLiveLoopDtos.Loop> parseLlmLoops(String raw) {
        List<CmLiveLoopDtos.Loop> out = new ArrayList<>();
        if (raw == null) return out;
        String s = raw.trim();
        if (s.startsWith("```")) {
            int nl = s.indexOf('\n');
            if (nl > 0) s = s.substring(nl + 1);
            if (s.endsWith("```")) s = s.substring(0, s.length() - 3).trim();
        }
        int lb = s.indexOf('{'), rb = s.lastIndexOf('}');
        if (lb >= 0 && rb > lb) s = s.substring(lb, rb + 1);

        try {
            JsonNode root = JSON.readTree(s);
            JsonNode arr = root.path("loops");
            int idx = 0;
            if (arr.isArray()) {
                for (JsonNode item : arr) {
                    idx++;
                    List<CmLiveLoopDtos.Sentence> sents = new ArrayList<>();
                    JsonNode sn = item.path("sentences");
                    if (sn.isArray()) {
                        for (JsonNode si : sn) {
                            sents.add(CmLiveLoopDtos.Sentence.builder()
                                    .start(si.path("start").asDouble(0))
                                    .end(si.path("end").asDouble(0))
                                    .text(si.path("text").asText(""))
                                    .isHighlight(si.path("isHighlight").asBoolean(false))
                                    .build());
                        }
                    }
                    List<String> kws = new ArrayList<>();
                    JsonNode kn = item.path("keywords");
                    if (kn.isArray()) for (JsonNode k : kn) kws.add(k.asText(""));
                    out.add(CmLiveLoopDtos.Loop.builder()
                            .idx(idx)
                            .productName(item.path("productName").asText("循环 " + idx))
                            .start(item.path("start").asDouble(0))
                            .end(item.path("end").asDouble(0))
                            .keywords(kws)
                            .sentences(sents)
                            .selected(false)
                            .build());
                }
            }
        } catch (Exception e) {
            log.warn("[LiveLoop] parse LLM JSON failed: {}", e.getMessage());
        }
        return out;
    }

    /** LLM 失败时兜底：单循环（语义保守 — 没法本地判定重复，全部归一个循环最安全）。
     *  注：原"等长切分"实现违背循环=重复点的语义，已废弃。 */
    @SuppressWarnings("unused")
    private static List<CmLiveLoopDtos.Loop> fallbackEqualSplit(
            List<AsrAdapter.AsrResult.Segment> asrSegs, double minLoopSec) {
        List<CmLiveLoopDtos.Loop> out = new ArrayList<>();
        if (asrSegs.isEmpty()) return out;
        List<CmLiveLoopDtos.Sentence> sents = new ArrayList<>();
        for (AsrAdapter.AsrResult.Segment a : asrSegs) {
            sents.add(CmLiveLoopDtos.Sentence.builder()
                    .start(a.getStart()).end(a.getEnd()).text(a.getText())
                    .isHighlight(false).build());
        }
        double start = asrSegs.get(0).getStart();
        double end = asrSegs.get(asrSegs.size() - 1).getEnd();
        out.add(CmLiveLoopDtos.Loop.builder()
                .idx(1).productName("整段（未检测到重复）")
                .start(start).end(end)
                .sentences(sents).keywords(new ArrayList<>()).selected(false).build());
        return out;
    }

    private static CmLiveLoopDtos.DetectResult failed(String msg, long start) {
        return CmLiveLoopDtos.DetectResult.builder()
                .status("FAILED").errMsg(msg)
                .elapsedMs(System.currentTimeMillis() - start).build();
    }

    // ─── 导出 ────────────────────────────────────────────────────────────────

    public CmLiveLoopDtos.ExportResult export(CmLiveLoopDtos.ExportCmd cmd) {
        try {
            Path video = storage.resolveAssetByCode(cmd.getInputAssetCode());
            if (video == null) throw new GenericBusinessException("assetCode 不存在");
            List<CmLiveLoopDtos.Loop> loops = cmd.getLoops() == null ? new ArrayList<>() : cmd.getLoops();
            if (loops.isEmpty()) {
                return CmLiveLoopDtos.ExportResult.builder()
                        .status("FAILED").errMsg("无 loops 可导出").build();
            }

            String fmt = cmd.getFormat() == null ? "mp4" : cmd.getFormat();
            String codec = "hevc".equalsIgnoreCase(cmd.getCodec()) ? "libx265" : "libx264";

            String batchCode = "batch-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            Path batchDir = storage.allocateTempDir(batchCode);

            // 按 productName 分目录
            int clipCount = 0;
            Map<String, Integer> nameCount = new HashMap<>();
            for (CmLiveLoopDtos.Loop loop : loops) {
                if (loop.getStart() == null || loop.getEnd() == null || loop.getEnd() <= loop.getStart()) continue;
                String productDir = sanitizeFileName(
                        loop.getProductName() == null || loop.getProductName().isBlank()
                                ? "未命名" : loop.getProductName());
                Path subDir = batchDir.resolve(productDir);
                Files.createDirectories(subDir);
                int suffix = nameCount.merge(productDir, 1, Integer::sum);
                String clipName = String.format("loop-%03d-第%d轮.%s", loop.getIdx(), suffix, fmt);
                Path clipPath = subDir.resolve(clipName);
                double dur = loop.getEnd() - loop.getStart();

                CmFFmpegRunner.Result r = ffmpeg.runFfmpeg(List.of(
                        "-y",
                        "-ss", String.format("%.3f", loop.getStart()),
                        "-i", video.toString(),
                        "-t", String.format("%.3f", dur),
                        "-c:v", codec, "-preset", "veryfast", "-crf", "23",
                        "-c:a", "aac", "-b:a", "128k",
                        clipPath.toString()
                ));
                if (!r.ok()) {
                    log.warn("[LiveLoop/export] loop {} failed: exit={}", loop.getIdx(), r.exitCode());
                    continue;
                }
                clipCount++;

                // 旁路写一份 srt 字幕（可选，便于直接拖入剪映）
                Path srtPath = subDir.resolve(clipName.replaceFirst("\\.[a-z0-9]+$", ".srt"));
                writeSrt(srtPath, loop.getSentences(), loop.getStart());
            }

            // zip
            String zipCode = "asset-" + UUID.randomUUID().toString().replace("-", "");
            Path zipPath = storage.allocateRenderOutput(zipCode, "zip");
            try (ZipOutputStream out = new ZipOutputStream(Files.newOutputStream(zipPath))) {
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
            log.info("[LiveLoop/export] {} loops → zip {}", clipCount, zipPath);
            return CmLiveLoopDtos.ExportResult.builder()
                    .status("SUCCEEDED").zipUrl(storage.streamUrl(zipCode)).clipCount(clipCount).build();
        } catch (Exception e) {
            log.error("[LiveLoop/export] failed", e);
            return CmLiveLoopDtos.ExportResult.builder()
                    .status("FAILED").errMsg(e.getMessage()).build();
        }
    }

    /** 写 srt 字幕（时间戳转换为 loop 内相对时间） */
    private static void writeSrt(Path path, List<CmLiveLoopDtos.Sentence> sents, double loopStart) throws IOException {
        if (sents == null || sents.isEmpty()) return;
        StringBuilder sb = new StringBuilder();
        int n = 0;
        for (CmLiveLoopDtos.Sentence s : sents) {
            n++;
            double from = Math.max(0, s.getStart() - loopStart);
            double to = Math.max(from + 0.1, s.getEnd() - loopStart);
            sb.append(n).append('\n')
                    .append(srtTime(from)).append(" --> ").append(srtTime(to)).append('\n')
                    .append(s.getText() == null ? "" : s.getText()).append("\n\n");
        }
        Files.writeString(path, sb.toString());
    }

    private static String srtTime(double sec) {
        int h = (int) (sec / 3600);
        int m = (int) ((sec % 3600) / 60);
        double rem = sec - h * 3600 - m * 60;
        int s = (int) rem;
        int ms = (int) Math.round((rem - s) * 1000);
        return String.format("%02d:%02d:%02d,%03d", h, m, s, ms);
    }

    private static String sanitizeFileName(String s) {
        if (s == null) return "untitled";
        String t = s.replaceAll("[\\\\/:*?\"<>|\\r\\n]", "_").trim();
        if (t.isEmpty()) t = "untitled";
        if (t.length() > 60) t = t.substring(0, 60);
        return t;
    }
}
