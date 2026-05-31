package com.beukay.marketing.person.app.cutmatrix.tts;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Objects;

/**
 * 阿里云百炼 qwen-tts-latest TTS。
 * 协议：DashScope native multimodal-generation 端点，返回 OSS WAV URL，下载后写入存储。
 *
 * 启用：cm.tts.provider=dashscope（默认）
 */
@Service
@Log4j2
@ConditionalOnProperty(value = "cm.tts.provider", havingValue = "dashscope", matchIfMissing = true)
public class DashScopeTtsAdapter implements TtsAdapter {

    @Value("${cm.tts.dashscope.api-key:${cm.asr.dashscope.api-key:}}")
    private String apiKey;

    @Value("${cm.tts.dashscope.model:qwen-tts-latest}")
    private String model;

    @Value("${cm.tts.dashscope.base-url:https://dashscope.aliyuncs.com/api/v1}")
    private String baseUrl;

    private static final ObjectMapper JSON = new ObjectMapper();
    private static final int MAX_RETRIES = 3;
    private static final long BASE_RETRY_DELAY_MS = 2000L;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    /** qwen-tts-latest 官方音色（2026-04） */
    private static final List<Voice> VOICES = List.of(
            // 推荐
            Voice.builder().id("Cherry").name("Cherry · 樱桃").gender("female").style("通用·甜美").lang("zh-cn").starred(true).build(),
            Voice.builder().id("Ethan").name("Ethan · 伊森").gender("male").style("通用·磁性").lang("zh-cn").starred(true).build(),
            Voice.builder().id("Serena").name("Serena · 赛琳娜").gender("female").style("通用·温柔").lang("zh-cn").starred(true).build(),
            Voice.builder().id("Chelsie").name("Chelsie · 切尔西").gender("female").style("通用·活力").lang("zh-cn").starred(true).build(),
            // 方言
            Voice.builder().id("Dylan").name("Dylan · 北京话").gender("male").style("方言·北京").lang("zh-cn").build(),
            Voice.builder().id("Jada").name("Jada · 上海话").gender("female").style("方言·上海").lang("zh-cn").build(),
            Voice.builder().id("Sunny").name("Sunny · 四川话").gender("female").style("方言·四川").lang("zh-cn").build()
    );

    @Override
    public byte[] synth(String text, String voiceId, double speed) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("cm.tts.dashscope.api-key 未配置");
        }
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("text 为空");
        }
        if (voiceId == null || voiceId.isBlank()) voiceId = "Cherry";
        // 注：qwen-tts-latest 不支持 speed 参数，仅 cosyvoice-v2 native WebSocket 支持。这里忽略 speed，前端可后置变速。

        Exception lastEx = null;
        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                return doSynth(text, voiceId);
            } catch (Exception e) {
                lastEx = e;
                String msg = e.getMessage() == null ? "" : e.getMessage();
                if (attempt < MAX_RETRIES && isRateLimitError(msg)) {
                    long delay = BASE_RETRY_DELAY_MS << attempt; // 2s, 4s, 8s
                    log.warn("[DashScopeTts] rate limited (attempt {}/{}), retry after {}ms: {}",
                            attempt + 1, MAX_RETRIES, delay, msg);
                    Thread.sleep(delay);
                } else {
                    throw e;
                }
            }
        }
        throw Objects.requireNonNull(lastEx);
    }

    private static boolean isRateLimitError(String msg) {
        return msg.contains("429")
                || msg.contains("Throttling")
                || msg.contains("rate_limit")
                || msg.contains("RateQuota")
                || msg.contains("too many requests");
    }

    private byte[] doSynth(String text, String voiceId) throws Exception {
        long t0 = System.currentTimeMillis();

        // 1. 调 multimodal-generation 拿 OSS URL
        ObjectNode body = JSON.createObjectNode();
        body.put("model", model);
        ObjectNode input = body.putObject("input");
        input.put("text", text);
        input.put("voice", voiceId);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/services/aigc/multimodal-generation/generation"))
                .timeout(Duration.ofMinutes(2))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(body)))
                .build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() / 100 != 2) {
            String tail = resp.body() == null ? "" : resp.body();
            if (tail.length() > 500) tail = tail.substring(0, 500);
            throw new IllegalStateException("DashScope TTS HTTP " + resp.statusCode() + ": " + tail);
        }

        JsonNode root = JSON.readTree(resp.body());
        // 检查应用层错误（HTTP 200 但有 rate limit 错误码）
        String code = root.path("code").asText("");
        if (!code.isEmpty()) {
            String message = root.path("message").asText(resp.body());
            throw new IllegalStateException("DashScope TTS error " + code + ": " + message);
        }

        String audioUrl = root.path("output").path("audio").path("url").asText("");
        if (audioUrl.isEmpty()) {
            throw new IllegalStateException("TTS 返回无 audio URL: " + resp.body());
        }

        // 2. 下载 WAV 字节
        HttpRequest dlReq = HttpRequest.newBuilder()
                .uri(URI.create(audioUrl))
                .timeout(Duration.ofMinutes(2))
                .GET()
                .build();
        HttpResponse<byte[]> dlResp = http.send(dlReq, HttpResponse.BodyHandlers.ofByteArray());
        if (dlResp.statusCode() / 100 != 2) {
            throw new IllegalStateException("OSS 下载失败 HTTP " + dlResp.statusCode());
        }

        long elapsed = System.currentTimeMillis() - t0;
        byte[] audio = dlResp.body();
        log.info("[DashScopeTts] {} chars / voice={} → {} bytes wav in {}ms",
                text.length(), voiceId, audio.length, elapsed);
        return audio;
    }

    @Override
    public List<Voice> listVoices() {
        return VOICES;
    }
}
