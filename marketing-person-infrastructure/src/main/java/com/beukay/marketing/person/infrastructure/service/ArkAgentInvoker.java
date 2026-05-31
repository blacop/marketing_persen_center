package com.beukay.marketing.person.infrastructure.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 火山方舟 Agent 对话调用器
 * <p>
 * 使用 Ark /chat/completions 接口，以 behaviorDsl 为 system prompt，
 * 支持多轮对话历史传入。
 */
@Component
@Log4j2
public class ArkAgentInvoker {

    private static final String DEFAULT_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
    private static final String DEFAULT_MODEL = "doubao-seed-2.0-pro";
    private static final int MAX_HISTORY_TURNS = 10;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String baseUrl;
    private final String defaultModel;

    public ArkAgentInvoker(
            ObjectMapper objectMapper,
            @Value("${ark.api-key:}") String apiKey,
            @Value("${ark.base-url:" + DEFAULT_BASE_URL + "}") String baseUrl,
            @Value("${ark.vision-model:" + DEFAULT_MODEL + "}") String defaultModel) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.defaultModel = defaultModel;
    }

    /**
     * 单轮/多轮对话调用
     *
     * @param systemPrompt  来自 AgentDefinition.behaviorDsl
     * @param history       历史对话（role=user/assistant），最多取末尾 MAX_HISTORY_TURNS 条
     * @param userMessage   当前用户消息
     * @param modelOverride 模型覆盖（null 时使用默认）
     * @return assistant 回复内容
     */
    public String chat(String systemPrompt,
                       List<Map<String, String>> history,
                       String userMessage,
                       String modelOverride) throws IOException, InterruptedException {
        requireApiKey();

        String model = (modelOverride != null && !modelOverride.isBlank()) ? modelOverride : defaultModel;

        List<Map<String, Object>> messages = new ArrayList<>();
        // system prompt
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            messages.add(Map.of("role", "system", "content", systemPrompt));
        }
        // history（截取末尾 N 轮）
        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - MAX_HISTORY_TURNS * 2);
            for (int i = start; i < history.size(); i++) {
                Map<String, String> turn = history.get(i);
                messages.add(Map.of("role", turn.getOrDefault("role", "user"),
                        "content", turn.getOrDefault("content", "")));
            }
        }
        // current message
        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("model", model);
        payload.put("messages", messages);

        String requestBody = objectMapper.writeValueAsString(payload);
        log.info("方舟 Agent 对话: model={} historyTurns={}", model, history == null ? 0 : history.size());

        HttpRequest httpRequest = HttpRequest.newBuilder(URI.create(normalizeBaseUrl() + "/chat/completions"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        ensureSuccess(response.statusCode(), response.body());

        String reply = extractReply(objectMapper.readTree(response.body()));
        log.info("方舟 Agent 响应: replyLength={}", reply == null ? 0 : reply.length());
        return reply;
    }

    private String normalizeBaseUrl() {
        String url = baseUrl;
        if (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        return url;
    }

    private void requireApiKey() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("方舟 API Key 未配置，请在 application-local.yaml 中配置 ark.api-key");
        }
    }

    private void ensureSuccess(int statusCode, String body) {
        if (statusCode < 200 || statusCode >= 300) {
            String sanitized = sanitize(body);
            throw new IllegalStateException("方舟 Agent 对话失败，HTTP=" + statusCode + "，" + sanitized);
        }
    }

    private String sanitize(String body) {
        if (body == null || body.isBlank()) {
            return "上游无错误详情";
        }
        String s = body.replaceAll("[\\r\\n]+", " ").trim();
        return s.length() > 200 ? s.substring(0, 200) + "..." : s;
    }

    private String extractReply(JsonNode root) {
        JsonNode choices = root.get("choices");
        if (choices == null || !choices.isArray() || choices.isEmpty()) {
            return null;
        }
        JsonNode message = choices.get(0).get("message");
        if (message == null) {
            return null;
        }
        JsonNode content = message.get("content");
        return content == null || content.isNull() ? null : content.asText();
    }
}
