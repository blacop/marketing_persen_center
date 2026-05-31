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
 * 百炼视觉语言模型客户端（qwen-vl-plus）：图像 + 文本 → 文本响应
 * 调多模态 generation endpoint，跟 ASR 共用 URL。
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class DashScopeVisionClient {

    private final DashScopeProperties props;
    private final ObjectMapper objectMapper;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    /**
     * 单次视觉 + 文本调用，返回 LLM 文本。
     *
     * @param imageJpg JPEG 图片（base64 编码后塞入 data URI）
     * @param userPrompt 文本提示
     */
    public String classify(Path imageJpg, String userPrompt) throws IOException, InterruptedException {
        if (props.getApiKey() == null || props.getApiKey().isBlank()) {
            throw new IllegalStateException("dashscope.api-key 未配置");
        }
        byte[] bytes = Files.readAllBytes(imageJpg);
        String base64 = Base64.getEncoder().encodeToString(bytes);
        String dataUri = "data:image/jpeg;base64," + base64;

        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", props.getVlModel());
        ObjectNode input = body.putObject("input");
        var msgs = input.putArray("messages");
        ObjectNode userMsg = msgs.addObject();
        userMsg.put("role", "user");
        var content = userMsg.putArray("content");
        content.addObject().put("image", dataUri);
        content.addObject().put("text", userPrompt);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(props.getGenerationEndpoint()))
                .timeout(Duration.ofSeconds(props.getHttpTimeoutSeconds()))
                .header("Authorization", "Bearer " + props.getApiKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() / 100 != 2) {
            throw new IOException("VL HTTP " + resp.statusCode() + ": " + truncate(resp.body(), 500));
        }
        JsonNode root = objectMapper.readTree(resp.body());
        // 多模态返回结构：output.choices[0].message.content[]，可能是字符串数组或对象
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
        // 兜底：尝试 output.text
        return root.path("output").path("text").asText("");
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
