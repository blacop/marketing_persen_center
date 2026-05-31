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
import java.util.Base64;

/**
 * 百炼全模态客户端（qwen3-omni-flash）：视频 + 文本 → 文本响应
 * 视频以 base64 data URI 形式传入。
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class DashScopeOmniClient {

    private final DashScopeProperties props;
    private final ObjectMapper objectMapper;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    /**
     * 视频 + 文本 → 文本响应。视频文件 base64 编码后 data URI 传入。
     * 单次 payload 应控制在 10MB 以内。
     */
    public String analyzeVideo(Path videoMp4, String userPrompt) throws IOException, InterruptedException {
        if (props.getApiKey() == null || props.getApiKey().isBlank()) {
            throw new IllegalStateException("dashscope.api-key 未配置");
        }
        byte[] bytes = Files.readAllBytes(videoMp4);
        long sizeKB = bytes.length / 1024;
        log.info("[omni] sending video {} ({}KB)", videoMp4.getFileName(), sizeKB);
        String base64 = Base64.getEncoder().encodeToString(bytes);
        String dataUri = "data:video/mp4;base64," + base64;

        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", props.getOmniModel());
        ObjectNode input = body.putObject("input");
        var msgs = input.putArray("messages");
        ObjectNode userMsg = msgs.addObject();
        userMsg.put("role", "user");
        var content = userMsg.putArray("content");
        content.addObject().put("video", dataUri);
        content.addObject().put("text", userPrompt);
        // 让 omni 模型走"思考模式"以便更准确分析视频内容（该参数仅 omni 支持，其它模型会忽略）
        ObjectNode params = body.putObject("parameters");
        params.put("result_format", "message");

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(props.getGenerationEndpoint()))
                .timeout(Duration.ofSeconds(props.getHttpTimeoutSeconds() * 2L))
                .header("Authorization", "Bearer " + props.getApiKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() / 100 != 2) {
            throw new IOException("Omni HTTP " + resp.statusCode() + ": " + truncate(resp.body(), 800));
        }
        JsonNode root = objectMapper.readTree(resp.body());
        JsonNode choices = root.path("output").path("choices");
        if (choices.isArray() && choices.size() > 0) {
            JsonNode msgContent = choices.get(0).path("message").path("content");
            if (msgContent.isTextual()) return msgContent.asText();
            if (msgContent.isArray()) {
                StringBuilder sb = new StringBuilder();
                for (JsonNode c : msgContent) {
                    if (c.isTextual()) sb.append(c.asText());
                    else if (c.has("text")) sb.append(c.path("text").asText());
                }
                return sb.toString();
            }
        }
        return root.path("output").path("text").asText("");
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
