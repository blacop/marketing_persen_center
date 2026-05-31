package com.beukay.marketing.person.infrastructure.composition.asr;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.io.IOException;
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

/**
 * 百炼 Qwen3-ASR 客户端：把本地音频 base64 后调多模态 generation 接口，
 * 返回带时间戳的句子序列。
 *
 * 协议：multimodal-generation（同步），单次音频 ≤ 5 分钟、payload ≤ 10MB。
 * 长音频由调用方分块后多次调用。
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class DashScopeAsrClient {

    private final DashScopeProperties props;
    private final ObjectMapper objectMapper;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public record Sentence(long beginMs, long endMs, String text) {}

    public List<Sentence> recognize(Path mp3, String mime) throws IOException, InterruptedException {
        if (props.getApiKey() == null || props.getApiKey().isBlank()) {
            throw new IllegalStateException("dashscope.api-key 未配置，请先在 Nacos 或环境变量 DASHSCOPE_API_KEY 设置");
        }
        byte[] bytes = Files.readAllBytes(mp3);
        String base64 = Base64.getEncoder().encodeToString(bytes);
        String dataUri = "data:" + (mime == null ? "audio/mp3" : mime) + ";base64," + base64;

        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", props.getAsrModel());
        ObjectNode input = body.putObject("input");
        var msgs = input.putArray("messages");
        ObjectNode userMsg = msgs.addObject();
        userMsg.put("role", "user");
        var content = userMsg.putArray("content");
        content.addObject().put("audio", dataUri);
        // parameters 留空 —— 默认开启句子级时间戳

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(props.getGenerationEndpoint()))
                .timeout(Duration.ofSeconds(props.getHttpTimeoutSeconds()))
                .header("Authorization", "Bearer " + props.getApiKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        log.info("[asr] request {} bytes audio (~{}KB)", bytes.length, bytes.length / 1024);
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() / 100 != 2) {
            throw new IOException("ASR HTTP " + resp.statusCode() + ": " + truncate(resp.body(), 500));
        }
        log.debug("[asr] resp body (first 1k): {}", truncate(resp.body(), 1000));
        return parseSentences(resp.body());
    }

    /**
     * 解析返回的 sentences。Qwen3-ASR 通常在 output.sentences[]，
     * 每条 {begin_time, end_time, text}（毫秒）。如果只有纯文本则单条覆盖整段。
     */
    private List<Sentence> parseSentences(String json) throws IOException {
        JsonNode root = objectMapper.readTree(json);
        JsonNode output = root.path("output");
        List<Sentence> out = new ArrayList<>();

        // 路径 1：output.sentences[]
        JsonNode sentences = output.path("sentences");
        if (sentences.isArray() && sentences.size() > 0) {
            for (JsonNode s : sentences) {
                long begin = s.path("begin_time").asLong(s.path("beginTime").asLong(0));
                long end = s.path("end_time").asLong(s.path("endTime").asLong(0));
                String text = s.path("text").asText("");
                if (end > begin) out.add(new Sentence(begin, end, text));
            }
            return out;
        }

        // 路径 2：output.choices[0].message.content[]，找带时间戳的对象
        JsonNode choices = output.path("choices");
        if (choices.isArray() && choices.size() > 0) {
            JsonNode msgContent = choices.get(0).path("message").path("content");
            if (msgContent.isArray()) {
                for (JsonNode c : msgContent) {
                    if (c.has("sentences") && c.path("sentences").isArray()) {
                        for (JsonNode s : c.path("sentences")) {
                            long begin = s.path("begin_time").asLong(0);
                            long end = s.path("end_time").asLong(0);
                            String text = s.path("text").asText("");
                            if (end > begin) out.add(new Sentence(begin, end, text));
                        }
                    } else if (c.has("text")) {
                        // 纯文本兜底（无时间戳）
                        String text = c.path("text").asText("");
                        if (!text.isBlank() && out.isEmpty()) {
                            out.add(new Sentence(0, 0, text));
                        }
                    }
                }
            } else if (msgContent.isTextual()) {
                String text = msgContent.asText();
                if (!text.isBlank()) out.add(new Sentence(0, 0, text));
            }
        }

        if (out.isEmpty()) {
            log.warn("[asr] no sentences parsed from response: {}", truncate(json, 500));
        }
        return out;
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "...(truncated)";
    }
}
