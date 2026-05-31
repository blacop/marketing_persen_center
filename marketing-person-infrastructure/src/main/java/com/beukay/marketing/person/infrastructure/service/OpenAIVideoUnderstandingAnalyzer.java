package com.beukay.marketing.person.infrastructure.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

// 备用：生产环境可切换回 OpenAI，添加 @Primary 即可
@Component
public class OpenAIVideoUnderstandingAnalyzer implements VideoUnderstandingAnalyzer {

    private static final String DEFAULT_BASE_URL = "https://api.openai.com/v1";
    private static final String DEFAULT_TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";
    private static final String DEFAULT_VISION_MODEL = "gpt-4o-mini";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Autowired
    public OpenAIVideoUnderstandingAnalyzer(ObjectMapper objectMapper) {
        this(objectMapper, HttpClient.newHttpClient());
    }

    OpenAIVideoUnderstandingAnalyzer(ObjectMapper objectMapper, HttpClient httpClient) {
        this.objectMapper = objectMapper;
        this.httpClient = httpClient;
    }

    @Override
    public VideoUnderstandingAnalysis analyze(VideoUnderstandingRequest request) {
        try {
            String transcript = transcribe(request.getPreparedVideoAssets().audioPath());
            JsonNode structured = analyzeFrames(request, transcript);
            return VideoUnderstandingAnalysis.builder()
                    .summary(text(structured, "summary"))
                    .transcript(transcript)
                    .ocrTexts(stringList(structured, "ocrTexts"))
                    .frameObservations(objectList(structured, "frameObservations"))
                    .hookType(defaultIfBlank(text(structured, "hookType"), "其他"))
                    .titlePattern(defaultIfBlank(text(structured, "titlePattern"), "GENERAL_SEEDING"))
                    .sceneTags(stringList(structured, "sceneTags"))
                    .sellingPointTags(stringList(structured, "sellingPointTags"))
                    .ctaTags(stringList(structured, "ctaTags"))
                    .emotionTags(stringList(structured, "emotionTags"))
                    .targetAudienceTags(stringList(structured, "targetAudienceTags"))
                    .reasoning(text(structured, "reasoning"))
                    .build();
        } catch (IOException | InterruptedException e) {
            throw new IllegalStateException("OpenAI 视频理解失败", e);
        }
    }

    private String transcribe(Path audioPath) throws IOException, InterruptedException {
        String apiKey = requireApiKey();
        String boundary = "----CodexBoundary" + UUID.randomUUID();
        byte[] fileBytes = Files.readAllBytes(audioPath);
        byte[] body = MultipartBodyBuilder.builder(boundary)
                .field("model", transcriptionModel())
                .file("file", audioPath.getFileName().toString(), "audio/mpeg", fileBytes)
                .build();

        HttpRequest request = HttpRequest.newBuilder(baseUri("/audio/transcriptions"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        ensureSuccess(response.statusCode(), response.body(), "音频转写");
        JsonNode json = objectMapper.readTree(response.body());
        return text(json, "text");
    }

    private JsonNode analyzeFrames(VideoUnderstandingRequest request, String transcript) throws IOException, InterruptedException {
        String apiKey = requireApiKey();
        List<Map<String, Object>> content = new ArrayList<>();
        content.add(Map.of(
                "type", "input_text",
                "text", buildPrompt(request, transcript)
        ));
        for (FfmpegVideoPreprocessor.KeyFrameAsset frame : request.getPreparedVideoAssets().keyFrames()) {
            String mimeType = guessMimeType(frame.imagePath());
            String dataUrl = "data:" + mimeType + ";base64," + Base64.getEncoder().encodeToString(Files.readAllBytes(frame.imagePath()));
            content.add(Map.of(
                    "type", "input_image",
                    "image_url", dataUrl
            ));
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("model", visionModel());
        payload.put("input", List.of(Map.of(
                "role", "user",
                "content", content
        )));

        HttpRequest requestHttp = HttpRequest.newBuilder(baseUri("/responses"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build();
        HttpResponse<String> response = httpClient.send(requestHttp, HttpResponse.BodyHandlers.ofString());
        ensureSuccess(response.statusCode(), response.body(), "多模态分析");
        JsonNode body = objectMapper.readTree(response.body());
        String outputText = extractOutputText(body);
        if (outputText == null || outputText.isBlank()) {
            throw new IllegalStateException("OpenAI 未返回结构化文本结果");
        }
        return objectMapper.readTree(cleanJsonFence(outputText));
    }

    private String buildPrompt(VideoUnderstandingRequest request, String transcript) {
        String productTruth = "";
        if (request.getProductTruth() != null) {
            productTruth = "\n商品背景：" + safe(request.getProductTruth().getProductName())
                    + "\n推荐场景：" + safe(request.getProductTruth().getPreferredScenes())
                    + "\n证据卖点：" + safe(request.getProductTruth().getEvidencePoints())
                    + "\n适用人群：" + safe(request.getProductTruth().getTargetSkinType())
                    + "\n促销机制：" + safe(request.getProductTruth().getPromotionMechanisms());
        }
        return "你是视频内容拆解分析助手。请基于关键帧画面、画面文字 OCR、音频 transcript，输出一个 JSON 对象，不要输出 markdown。"
                + "JSON 必须包含字段：summary, ocrTexts, frameObservations, hookType, titlePattern, sceneTags, sellingPointTags, ctaTags, emotionTags, targetAudienceTags, reasoning。"
                + "frameObservations 是数组，每项包含 timestampSec, visualSummary, ocrText。"
                + "hookType 候选：情绪共鸣型/场景植入型/技术卖点型/明星背书型/价格机制型/其他。"
                + "titlePattern 候选：EMOTION_QUESTION/TECHNICAL_PROOF/SCENE_SEEDING/OFFER_MECHANISM/CELEBRITY_ENDORSEMENT/GENERAL_SEEDING。"
                + "\nSKU=" + safe(request.getSkuId())
                + "\nSourceName=" + safe(request.getSourceName())
                + "\nTranscript=\n" + safe(transcript)
                + productTruth;
    }

    private URI baseUri(String path) {
        String baseUrl = System.getenv().getOrDefault("OPENAI_BASE_URL", DEFAULT_BASE_URL);
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return URI.create(baseUrl + path);
    }

    private String requireApiKey() {
        String apiKey = System.getenv("OPENAI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("OPENAI_API_KEY 未配置");
        }
        return apiKey;
    }

    private String transcriptionModel() {
        return System.getenv().getOrDefault("VIDEO_UNDERSTANDING_TRANSCRIPTION_MODEL", DEFAULT_TRANSCRIPTION_MODEL);
    }

    private String visionModel() {
        return System.getenv().getOrDefault("VIDEO_UNDERSTANDING_VISION_MODEL", DEFAULT_VISION_MODEL);
    }

    private void ensureSuccess(int statusCode, String body, String action) {
        if (statusCode < 200 || statusCode >= 300) {
            throw new IllegalStateException(action + "失败，HTTP状态=" + statusCode + "，原因=" + sanitizeErrorBody(statusCode, body));
        }
    }

    private String sanitizeErrorBody(int statusCode, String body) {
        if (statusCode == 401) {
            return "OpenAI 鉴权失败，请检查 OPENAI_API_KEY";
        }
        if (body == null || body.isBlank()) {
            return "上游服务未返回错误详情";
        }
        String sanitized = body.replaceAll("sk-[A-Za-z0-9_-]+", "sk-****");
        sanitized = sanitized.replaceAll("[\\r\\n]+", " ").trim();
        if (sanitized.length() > 240) {
            sanitized = sanitized.substring(0, 240) + "...";
        }
        return sanitized;
    }

    private String extractOutputText(JsonNode body) {
        JsonNode outputText = body.get("output_text");
        if (outputText != null && outputText.isTextual()) {
            return outputText.asText();
        }
        JsonNode output = body.get("output");
        if (output == null || !output.isArray()) {
            return null;
        }
        StringBuilder sink = new StringBuilder();
        for (JsonNode item : output) {
            JsonNode content = item.get("content");
            if (content == null || !content.isArray()) {
                continue;
            }
            for (JsonNode part : content) {
                JsonNode text = part.get("text");
                if (text != null && text.isTextual()) {
                    sink.append(text.asText());
                }
            }
        }
        return sink.toString();
    }

    private List<String> stringList(JsonNode root, String fieldName) {
        JsonNode node = root.get(fieldName);
        if (node == null || !node.isArray()) {
            return List.of();
        }
        List<String> values = new ArrayList<>();
        for (JsonNode item : node) {
            if (item.isTextual()) {
                values.add(item.asText());
            }
        }
        return values;
    }

    private List<Map<String, Object>> objectList(JsonNode root, String fieldName) {
        JsonNode node = root.get(fieldName);
        if (node == null || !node.isArray()) {
            return List.of();
        }
        List<Map<String, Object>> values = new ArrayList<>();
        for (JsonNode item : node) {
            values.add(objectMapper.convertValue(item, Map.class));
        }
        return values;
    }

    private String text(JsonNode root, String fieldName) {
        JsonNode node = root.get(fieldName);
        return node == null || node.isNull() ? null : node.asText();
    }

    private String cleanJsonFence(String rawText) {
        String trimmed = rawText.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```[a-zA-Z0-9_-]*\\s*", "");
            trimmed = trimmed.replaceFirst("\\s*```$", "");
        }
        return trimmed.trim();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String defaultIfBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String guessMimeType(Path path) {
        String fileName = path.getFileName().toString().toLowerCase(Locale.ROOT);
        if (fileName.endsWith(".png")) {
            return "image/png";
        }
        return "image/jpeg";
    }

    private static class MultipartBodyBuilder {
        private final String boundary;
        private final List<byte[]> parts = new ArrayList<>();

        private MultipartBodyBuilder(String boundary) {
            this.boundary = boundary;
        }

        static MultipartBodyBuilder builder(String boundary) {
            return new MultipartBodyBuilder(boundary);
        }

        MultipartBodyBuilder field(String name, String value) {
            parts.add(("--" + boundary + "\r\n"
                    + "Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n"
                    + value + "\r\n").getBytes());
            return this;
        }

        MultipartBodyBuilder file(String name, String fileName, String contentType, byte[] bytes) {
            parts.add(("--" + boundary + "\r\n"
                    + "Content-Disposition: form-data; name=\"" + name + "\"; filename=\"" + fileName + "\"\r\n"
                    + "Content-Type: " + contentType + "\r\n\r\n").getBytes());
            parts.add(bytes);
            parts.add("\r\n".getBytes());
            return this;
        }

        byte[] build() {
            parts.add(("--" + boundary + "--\r\n").getBytes());
            int total = parts.stream().mapToInt(part -> part.length).sum();
            byte[] result = new byte[total];
            int offset = 0;
            for (byte[] part : parts) {
                System.arraycopy(part, 0, result, offset, part.length);
                offset += part.length;
            }
            return result;
        }
    }
}
