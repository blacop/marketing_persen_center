package com.beukay.marketing.person.app.cutmatrix.linkingest.asr;

import com.beukay.marketing.person.app.cutmatrix.runtime.CmFFmpegRunner;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 阿里云百炼 (DashScope) ASR：用 qwen3-omni-flash 多模态对话接口转写语音。
 *
 * 协议：OpenAI 兼容 chat/completions，audio 以 base64 内嵌。
 * 限制：单次音频建议 ≤3 分钟；超过会先用 ffmpeg 切片再分别转写。
 *
 * 启用：cm.asr.provider=dashscope
 */
@Service
@RequiredArgsConstructor
@Log4j2
@ConditionalOnProperty(value = "cm.asr.provider", havingValue = "dashscope")
public class DashScopeAsrAdapter implements AsrAdapter {

    private final CmFFmpegRunner ffmpeg;

    @Value("${cm.asr.dashscope.api-key}")
    private String apiKey;

    @Value("${cm.asr.dashscope.model:qwen3-omni-flash}")
    private String model;

    @Value("${cm.asr.dashscope.base-url:https://dashscope.aliyuncs.com/compatible-mode/v1}")
    private String baseUrl;

    /** 单段最大秒数。超过则切分多段并合并结果。 */
    private static final int MAX_SEGMENT_SEC = 180;

    /** 单文件 base64 后体积上限保护（默认 25 MB ≈ 30 分钟 16k mono wav） */
    private static final long MAX_AUDIO_BYTES = 25L * 1024 * 1024;

    private static final ObjectMapper JSON = new ObjectMapper();

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    @Override
    public AsrResult transcribe(Path audioFile, AsrOptions options) throws Exception {
        if (!Files.exists(audioFile)) {
            throw new IllegalArgumentException("音频文件不存在: " + audioFile);
        }
        long size = Files.size(audioFile);
        if (size > MAX_AUDIO_BYTES) {
            throw new IllegalStateException("音频文件过大 (" + size + " bytes)，超过 " + MAX_AUDIO_BYTES);
        }

        // 探时长，决定是否切片
        double dur;
        try {
            dur = ffmpeg.probe(audioFile).durationSec();
        } catch (Exception e) {
            log.warn("[DashScopeAsr] probe failed, assume <{}s: {}", MAX_SEGMENT_SEC, e.getMessage());
            dur = MAX_SEGMENT_SEC - 1;
        }
        String lang = options == null || options.getLang() == null ? "zh" : options.getLang();

        if (dur <= MAX_SEGMENT_SEC) {
            return transcribeSingle(audioFile, lang, 0);
        }
        return transcribeChunked(audioFile, dur, lang);
    }

    // ─── Single 段转写 ─────────────────────────────────────────────────────────

    private AsrResult transcribeSingle(Path wav, String lang, double offsetSec) throws Exception {
        long t0 = System.currentTimeMillis();
        byte[] bytes = Files.readAllBytes(wav);
        String b64 = Base64.getEncoder().encodeToString(bytes);
        String format = ext(wav.getFileName().toString()).toLowerCase();

        // 构造 chat/completions 请求体
        ObjectNode body = JSON.createObjectNode();
        body.put("model", model);
        body.put("stream", false);
        // omni 模型必须指定输出 modalities，否则会回多模态默认
        ArrayNode modalities = body.putArray("modalities");
        modalities.add("text");

        ArrayNode messages = body.putArray("messages");
        ObjectNode userMsg = messages.addObject();
        userMsg.put("role", "user");
        ArrayNode content = userMsg.putArray("content");

        // 音频
        ObjectNode audioPart = content.addObject();
        audioPart.put("type", "input_audio");
        ObjectNode audioObj = audioPart.putObject("input_audio");
        audioObj.put("data", "data:audio/" + format + ";base64," + b64);
        audioObj.put("format", format);

        // 文本指令
        ObjectNode textPart = content.addObject();
        textPart.put("type", "text");
        String langName = "zh".equalsIgnoreCase(lang) ? "中文" : ("en".equalsIgnoreCase(lang) ? "英文" : lang);
        textPart.put("text",
                "请把这段音频严格按口播原话转写为" + langName + "文本。要求：\n" +
                "1. 完整保留所有词语，不省略、不改写、不加旁白说明。\n" +
                "2. 自然按句切分，每个句子一行（用换行符分隔）。\n" +
                "3. 不要输出时间戳、说话人、注释、引号等标记，仅输出纯文本。\n" +
                "4. 如果音频静音或听不清，输出空字符串即可。");

        // 调 API
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/chat/completions"))
                .timeout(Duration.ofMinutes(5))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(body)))
                .build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        long elapsed = System.currentTimeMillis() - t0;

        if (resp.statusCode() / 100 != 2) {
            String tail = resp.body() == null ? "" : resp.body();
            if (tail.length() > 500) tail = tail.substring(0, 500);
            throw new IllegalStateException("DashScope HTTP " + resp.statusCode() + ": " + tail);
        }

        // 解析响应
        JsonNode root = JSON.readTree(resp.body());
        JsonNode choices = root.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            throw new IllegalStateException("DashScope 返回无 choices: " + resp.body());
        }
        String text = choices.get(0).path("message").path("content").asText("").trim();
        log.info("[DashScopeAsr] {}s audio → {} chars in {}ms", String.format("%.1f", offsetSec), text.length(), elapsed);

        // 按行切句作为伪 segments（DashScope chat 模式不返回时间戳，按字符比例分配）
        List<AsrResult.Segment> segs = splitToSegments(text, offsetSec, estimateDuration(wav));

        return AsrResult.builder()
                .text(text)
                .segments(segs)
                .provider("dashscope:" + model)
                .build();
    }

    // ─── 多段切片转写（音频 >180s） ────────────────────────────────────────────

    private AsrResult transcribeChunked(Path wav, double totalDur, String lang) throws Exception {
        log.info("[DashScopeAsr] {}s audio → chunked into {}s pieces", String.format("%.1f", totalDur), MAX_SEGMENT_SEC);
        StringBuilder fullText = new StringBuilder();
        List<AsrResult.Segment> allSegs = new ArrayList<>();

        int chunkIdx = 0;
        for (double offset = 0; offset < totalDur; offset += MAX_SEGMENT_SEC) {
            double dur = Math.min(MAX_SEGMENT_SEC, totalDur - offset);
            // ffmpeg -ss offset -t dur -i wav -c copy chunk.wav
            Path chunk = wav.resolveSibling(wav.getFileName().toString().replace(".wav", "") + "-chunk-" + (chunkIdx++) + ".wav");
            CmFFmpegRunner.Result r = ffmpeg.runFfmpeg(List.of(
                    "-y", "-ss", String.format("%.3f", offset),
                    "-t", String.format("%.3f", dur),
                    "-i", wav.toString(),
                    "-c:a", "copy",
                    chunk.toString()
            ));
            if (!r.ok()) {
                log.warn("[DashScopeAsr] chunk {} cut failed, skip: {}", chunkIdx, r.stderr());
                continue;
            }
            try {
                AsrResult sub = transcribeSingle(chunk, lang, offset);
                if (!sub.getText().isEmpty()) {
                    if (fullText.length() > 0) fullText.append("\n");
                    fullText.append(sub.getText());
                }
                if (sub.getSegments() != null) allSegs.addAll(sub.getSegments());
            } finally {
                try { Files.deleteIfExists(chunk); } catch (Exception ignore) { /* */ }
            }
        }

        return AsrResult.builder()
                .text(fullText.toString())
                .segments(allSegs)
                .provider("dashscope:" + model + "(chunked)")
                .build();
    }

    // ─── helpers ────────────────────────────────────────────────────────────

    private double estimateDuration(Path wav) {
        try { return ffmpeg.probe(wav).durationSec(); }
        catch (Exception e) { return 30; }
    }

    private static final Pattern P_SENT_SPLIT = Pattern.compile("(?<=[。！？!?\\n])");

    /** 按句切分文本，在 [offsetSec, offsetSec+totalDur] 内按字符数线性分配时间戳 */
    private static List<AsrResult.Segment> splitToSegments(String text, double offsetSec, double totalDur) {
        List<AsrResult.Segment> out = new ArrayList<>();
        if (text == null || text.isEmpty()) return out;
        String[] sentences = P_SENT_SPLIT.split(text);
        int totalChars = 0;
        List<String> sList = new ArrayList<>();
        for (String s : sentences) {
            String t = s.trim();
            if (!t.isEmpty()) {
                sList.add(t);
                totalChars += t.length();
            }
        }
        if (totalChars == 0) return out;
        double cursor = offsetSec;
        for (String s : sList) {
            double frac = (double) s.length() / totalChars;
            double dur = totalDur * frac;
            out.add(AsrResult.Segment.builder()
                    .start(cursor).end(cursor + dur).text(s).build());
            cursor += dur;
        }
        return out;
    }

    private static String ext(String name) {
        int i = name.lastIndexOf('.');
        return i < 0 ? "wav" : name.substring(i + 1);
    }
}
