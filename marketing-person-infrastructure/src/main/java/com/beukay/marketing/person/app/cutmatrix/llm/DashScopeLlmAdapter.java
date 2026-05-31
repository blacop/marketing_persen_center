package com.beukay.marketing.person.app.cutmatrix.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
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
import java.util.ArrayList;
import java.util.List;

/**
 * 阿里云百炼 (DashScope) LLM 适配器。
 * OpenAI 兼容 chat/completions。复用 ASR 同款 key。
 *
 * 启用：cm.llm.provider=dashscope
 */
@Service
@Log4j2
@ConditionalOnProperty(value = "cm.llm.provider", havingValue = "dashscope")
public class DashScopeLlmAdapter implements LlmAdapter {

    @Value("${cm.llm.dashscope.api-key:${cm.asr.dashscope.api-key:}}")
    private String apiKey;

    @Value("${cm.llm.dashscope.model:qwen-plus}")
    private String model;

    @Value("${cm.llm.dashscope.base-url:https://dashscope.aliyuncs.com/compatible-mode/v1}")
    private String baseUrl;

    private static final ObjectMapper JSON = new ObjectMapper();

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    @Override
    public List<String> rewrite(String original, int count, RewriteOptions options) throws Exception {
        return rewrite(null, original, count, options);
    }

    @Override
    public List<String> rewrite(String shotName, String original, int count, RewriteOptions options) throws Exception {
        String style = options == null || options.getStyle() == null ? "default" : options.getStyle();
        String styleAddon = switch (style.toLowerCase()) {
            case "kol"           -> "\n\n【风格补充】用 KOL 种草口吻（宝子们 / 集美们 / 敲重点 / 真的会回购 / 闭眼入 等抖音热词）。";
            case "live-commerce" -> "\n\n【风格补充】用电商直播话术（家人们 / 上车 / 这个价 / 拍三送二 / 卖完不补 等）。";
            case "colloquial"    -> "";
            default              -> "";
        };
        // 系统提示
        String sys = "你是短视频口播文案改写大师，专做爆款风格的语义改写。\n" +
                "擅长把平淡描述变成抖音网感强、口语化、有梗的版本，让每条文案都像主播亲口在说。";

        // 用户 prompt（reverse-engineered from autocut paraphrase output）
        String nameHint = (shotName == null || shotName.isBlank())
                ? ""
                : "\n分镜名：" + shotName + "（仅作参考，告诉你这条说什么）";

        String user = """
                请把以下分镜文案改写成 %d 个完全不同表达的版本。

                【核心要求】
                1. **语义不变**：传达的核心信息和卖点必须一致
                2. **彻底重写**：不是换近义词，要重新组织表达：
                   - 改换主语 / 称呼（你 / 兄弟 / 哥们儿 / 宝子 / 帅哥）
                   - 改换动词（试试 → 冲它 → 来一发 / 看看 → 瞅瞅 → 瞧瞧）
                   - 加比喻 / 夸张（流汗 → 花成地图 / 自然 → 跟天生好皮似的）
                   - 加感叹 / 反问 / 语气词（绝了！/ 够自然吧？/ 贼 / 特 / 超）
                   - 改换句式（陈述 → 反问 → 感叹）
                3. **网感口语化**：用抖音流行用语，避免书面语
                4. **每版风格不同**：v1 / v2 / v3 各自有不同侧重，避免雷同
                5. **长度控制**：每版字数与原文相近，±50%% 内
                6. **短词补全**：原文很短（≤4 字）时，可补全成短句而非直接复制
                   例：原文"抖音" → "抖音见 / 在抖音 / 抖音上"%s

                【输入】%s
                原文：%s

                【输出】严格 JSON（禁止 markdown code block 包裹）：
                {"versions":["...","...","..."]}

                versions 数组长度必须等于 %d。
                """.formatted(count, styleAddon, nameHint, original, count);

        // 默认温度 0.85（保证 N 版差异）
        Double temp = options == null || options.getTemperature() == null ? 0.85 : options.getTemperature();
        Integer mt   = options == null || options.getMaxTokens()   == null ? 600 : options.getMaxTokens();
        String resp = callChat(sys, user, temp, mt);

        // 解析 JSON
        List<String> out = new ArrayList<>();
        try {
            JsonNode root = JSON.readTree(stripCodeFence(resp));
            JsonNode versions = root.path("versions");
            if (versions.isArray()) {
                for (JsonNode v : versions) out.add(v.asText());
            }
        } catch (Exception e) {
            log.warn("[DashScopeLlm/rewrite] JSON parse failed, raw: {}", preview(resp));
        }
        // 兜底：若数量不对，补/截
        if (out.isEmpty()) {
            // 退一步按行切
            for (String line : resp.split("\n")) {
                String t = line.replaceAll("^[\\d\\.\\-、）)\\s]+", "").trim();
                if (!t.isEmpty()) out.add(t);
            }
        }
        if (out.size() > count) return out.subList(0, count);
        while (out.size() < count) out.add(original);
        return out;
    }

    @Override
    public String chat(String systemPrompt, String userPrompt, ChatOptions options) throws Exception {
        return callChat(systemPrompt, userPrompt,
                options == null ? null : options.getTemperature(),
                options == null ? null : options.getMaxTokens());
    }

    // ─── 底层 HTTP ──────────────────────────────────────────────────────────

    private String callChat(String sys, String user, Double temperature, Integer maxTokens) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("cm.llm.dashscope.api-key 未配置");
        }
        long t0 = System.currentTimeMillis();

        ObjectNode body = JSON.createObjectNode();
        body.put("model", model);
        body.put("stream", false);
        if (temperature != null) body.put("temperature", temperature);
        if (maxTokens != null) body.put("max_tokens", maxTokens);

        ArrayNode messages = body.putArray("messages");
        if (sys != null && !sys.isBlank()) {
            ObjectNode sysMsg = messages.addObject();
            sysMsg.put("role", "system");
            sysMsg.put("content", sys);
        }
        ObjectNode userMsg = messages.addObject();
        userMsg.put("role", "user");
        userMsg.put("content", user);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/chat/completions"))
                .timeout(Duration.ofMinutes(2))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(body)))
                .build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        long elapsed = System.currentTimeMillis() - t0;

        if (resp.statusCode() / 100 != 2) {
            String tail = resp.body() == null ? "" : resp.body();
            if (tail.length() > 500) tail = tail.substring(0, 500);
            throw new IllegalStateException("DashScope LLM HTTP " + resp.statusCode() + ": " + tail);
        }

        JsonNode root = JSON.readTree(resp.body());
        JsonNode choices = root.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            throw new IllegalStateException("LLM 返回无 choices: " + resp.body());
        }
        String content = choices.get(0).path("message").path("content").asText("");
        log.info("[DashScopeLlm] {} → {} chars in {}ms", model, content.length(), elapsed);
        return content;
    }

    private static String stripCodeFence(String s) {
        if (s == null) return "";
        String t = s.trim();
        if (t.startsWith("```")) {
            int firstNl = t.indexOf('\n');
            if (firstNl > 0) t = t.substring(firstNl + 1);
            if (t.endsWith("```")) t = t.substring(0, t.length() - 3).trim();
        }
        return t;
    }

    private static String preview(String s) {
        if (s == null) return "";
        return s.length() > 200 ? s.substring(0, 200) + "..." : s;
    }
}
