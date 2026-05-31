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
import java.time.Duration;

/**
 * 百炼 OpenAI 兼容 chat completion 客户端（用于自动归类 prompt）。
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class DashScopeChatClient {

    private final DashScopeProperties props;
    private final ObjectMapper objectMapper;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    /** 单次 chat 调用，返回 LLM 文本 */
    public String chat(String systemPrompt, String userPrompt, double temperature) throws IOException, InterruptedException {
        if (props.getApiKey() == null || props.getApiKey().isBlank()) {
            throw new IllegalStateException("dashscope.api-key 未配置");
        }
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", props.getChatModel());
        body.put("temperature", temperature);
        var msgs = body.putArray("messages");
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            msgs.addObject().put("role", "system").put("content", systemPrompt);
        }
        msgs.addObject().put("role", "user").put("content", userPrompt);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(props.getChatEndpoint()))
                .timeout(Duration.ofSeconds(props.getHttpTimeoutSeconds()))
                .header("Authorization", "Bearer " + props.getApiKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() / 100 != 2) {
            throw new IOException("Chat HTTP " + resp.statusCode() + ": " + truncate(resp.body(), 500));
        }
        JsonNode root = objectMapper.readTree(resp.body());
        return root.path("choices").path(0).path("message").path("content").asText("");
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "...(truncated)";
    }
}
