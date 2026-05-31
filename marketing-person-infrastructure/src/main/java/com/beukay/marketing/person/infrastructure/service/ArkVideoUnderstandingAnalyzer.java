package com.beukay.marketing.person.infrastructure.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
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

/**
 * 火山方舟视频理解分析器
 * <p>
 * 使用方舟多模态模型（doubao-vision-pro-32k 或可配置端点）进行：
 * 1. 关键帧视觉分析
 * 2. OCR 文字提取
 * 3. 音频/口播内容推断（基于帧内字幕 + 视觉语义，无需独立 ASR 接口）
 * 4. 内容结构拆解（hookType / titlePattern / 标签等）
 */
@Primary
@Component
@Log4j2
public class ArkVideoUnderstandingAnalyzer implements VideoUnderstandingAnalyzer {

    private static final String DEFAULT_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
    private static final String DEFAULT_VISION_MODEL = "doubao-vision-pro-32k";
    private static final int MAX_FRAMES = 8;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String baseUrl;
    private final String visionModel;

    public ArkVideoUnderstandingAnalyzer(
            ObjectMapper objectMapper,
            @Value("${ark.api-key:}") String apiKey,
            @Value("${ark.base-url:" + DEFAULT_BASE_URL + "}") String baseUrl,
            @Value("${ark.vision-model:" + DEFAULT_VISION_MODEL + "}") String visionModel) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.visionModel = visionModel;
    }

    @Override
    public VideoUnderstandingAnalysis analyze(VideoUnderstandingRequest request) {
        try {
            JsonNode structured = analyzeWithArk(request);
            String transcript = extractText(structured, "transcript");
            return VideoUnderstandingAnalysis.builder()
                    .summary(extractText(structured, "summary"))
                    .transcript(transcript)
                    .ocrTexts(extractStringList(structured, "ocrTexts"))
                    .frameObservations(extractObjectList(structured, "frameObservations"))
                    .hookType(defaultIfBlank(extractText(structured, "hookType"), "其他"))
                    .titlePattern(defaultIfBlank(extractText(structured, "titlePattern"), "GENERAL_SEEDING"))
                    .sceneTags(extractStringList(structured, "sceneTags"))
                    .sellingPointTags(extractStringList(structured, "sellingPointTags"))
                    .ctaTags(extractStringList(structured, "ctaTags"))
                    .emotionTags(extractStringList(structured, "emotionTags"))
                    .targetAudienceTags(extractStringList(structured, "targetAudienceTags"))
                    .reasoning(extractText(structured, "reasoning"))
                    .segments(extractSegments(structured))
                    .build();
        } catch (IOException | InterruptedException e) {
            throw new IllegalStateException("方舟视频理解失败: " + e.getMessage(), e);
        }
    }

    private JsonNode analyzeWithArk(VideoUnderstandingRequest request) throws IOException, InterruptedException {
        requireApiKey();

        List<Map<String, Object>> content = new ArrayList<>();

        // 文本提示
        content.add(Map.of("type", "text", "text", buildPrompt(request)));

        // 关键帧图片（最多 MAX_FRAMES 帧）
        List<FfmpegVideoPreprocessor.KeyFrameAsset> frames = request.getPreparedVideoAssets().keyFrames();
        int frameCount = Math.min(frames.size(), MAX_FRAMES);
        for (int i = 0; i < frameCount; i++) {
            FfmpegVideoPreprocessor.KeyFrameAsset frame = frames.get(i);
            String mimeType = guessMimeType(frame.imagePath());
            String dataUrl = "data:" + mimeType + ";base64,"
                    + Base64.getEncoder().encodeToString(Files.readAllBytes(frame.imagePath()));
            content.add(Map.of(
                    "type", "image_url",
                    "image_url", Map.of("url", dataUrl)
            ));
            log.debug("方舟分析：帧 {} / {} (t={}s)", i + 1, frameCount, frame.timestampSec());
        }

        Map<String, Object> message = new LinkedHashMap<>();
        message.put("role", "user");
        message.put("content", content);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("model", visionModel);
        payload.put("messages", List.of(message));

        String requestBody = objectMapper.writeValueAsString(payload);
        log.info("方舟请求: model={} frames={}", visionModel, frameCount);

        HttpRequest httpRequest = HttpRequest.newBuilder(URI.create(baseUrl + "/chat/completions"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        ensureSuccess(response.statusCode(), response.body(), "方舟多模态分析");

        String outputText = extractChoiceText(objectMapper.readTree(response.body()));
        if (outputText == null || outputText.isBlank()) {
            throw new IllegalStateException("方舟未返回结构化文本结果");
        }
        log.info("方舟响应成功, 输出长度={}", outputText.length());
        return objectMapper.readTree(cleanJsonFence(outputText));
    }

    private String buildPrompt(VideoUnderstandingRequest request) {
        int durationSec = request.getPreparedVideoAssets().durationSec();
        StringBuilder sb = new StringBuilder();
        sb.append("你是专业的抖音电商视频内容拆解助手，擅长将视频拆解为「最小单元库」。\n");
        sb.append("请仔细分析以下关键帧画面，从帧内字幕、文案、画面文字推断口播内容。\n\n");

        sb.append("【输出要求】\n");
        sb.append("输出一个 JSON 对象，不要输出 markdown 代码块，包含以下字段：\n\n");

        sb.append("① 视频级字段：\n");
        sb.append("- summary: 视频整体内容摘要\n");
        sb.append("- transcript: 根据字幕/画面文字推断的完整口播台词\n");
        sb.append("- ocrTexts: 所有帧中识别到的文字列表（数组）\n");
        sb.append("- hookType: 从以下候选值选一个：情绪共鸣型/场景植入型/技术卖点型/明星背书型/价格机制型/其他\n");
        sb.append("- titlePattern: 从以下候选值选一个：EMOTION_QUESTION/TECHNICAL_PROOF/SCENE_SEEDING/OFFER_MECHANISM/CELEBRITY_ENDORSEMENT/GENERAL_SEEDING\n");
        sb.append("- sceneTags: 场景标签数组\n");
        sb.append("- sellingPointTags: 卖点标签数组\n");
        sb.append("- ctaTags: 行动号召标签数组\n");
        sb.append("- emotionTags: 情绪标签数组\n");
        sb.append("- targetAudienceTags: 目标受众标签数组\n");
        sb.append("- reasoning: 选择 hookType 和 titlePattern 的理由\n\n");

        sb.append("② 片段级字段 segments（数组，按时间顺序，每项为一个「最小单元」）：\n");
        sb.append("  每项包含：\n");
        sb.append("  - index: 片段序号（从1开始）\n");
        sb.append("  - startSec: 片段开始秒\n");
        sb.append("  - endSec: 片段结束秒\n");
        sb.append("  - structureTag: 从以下候选值选一个：\n");
        sb.append("      钩子/功效可视化/产品亮相/妆效展示/达人演绎/口播证言/街拍证言/活动机制/反视觉疲劳/\n");
        sb.append("      妆效展示-全妆/妆效展示-反面教材/妆效展示-妆前妆后对比/妆效展示-左右脸对比/妆效展示-左右脸实测/\n");
        sb.append("      达人演绎-好奇心引入/达人演绎-产品展示/达人演绎-问题展示/达人演绎-使用体验/达人演绎-功效论证/\n");
        sb.append("      CTA收尾/定制实测/明星口播/街拍采访/行动号召/明星实证/口碑实证\n");
        sb.append("  - motivation: 痛点/卖点/亮点/拉踩点/转化点/技术点/打消顾虑点 中选一\n");
        sb.append("  - technique: 情绪渲染/问题展示/产品讲解/功效描述/动作演示/对比实证/个人体验/权威背书/打消顾虑/口碑背书 中选一\n");
        sb.append("  - cameraLanguage: 特写/全景/POV/手持/固定/中景/中近景/面部特写 中选一\n");
        sb.append("  - scene: 浴室/梳妆台/通勤/户外/办公室/直播间/街拍/室内/桌面/多源混剪/非美妆/多场景/精致室内/户外自然光 中选一\n");
        sb.append("  - signalStrength: 信号强度，整数1-5（5最强）\n");
        sb.append("  - keyPhrase: 该片段金句，多个关键词用 | 分隔\n");
        sb.append("  - script: 该片段对应的口播话术\n");
        sb.append("  - sellingPoint: 该片段主要卖点内容（简短描述）\n");
        sb.append("  - decisiveFrame: 是否是决定性画面（boolean）\n");
        sb.append("  - decisiveFrameDesc: 决定性画面描述（若 decisiveFrame=true 则填写）\n");
        sb.append("  - influencerLevel: 模特/无人物/明星/素人/KOC 中选一\n");
        sb.append("  - audiencePersona: 精致妈妈/新锐白领/Z世代/资深中产/小镇青年/都市蓝领/都市银发/无人物 中选一\n");
        sb.append("  - bgm: 无/轻快/ASMR/热门曲/紧迫感/轻音乐 中选一\n");
        sb.append("  - rhythm: 快剪/中速/慢推/ASMR极慢/慢剪 中选一\n");
        sb.append("  - wardrobe: 浴袍/通勤装/约会装/运动装/居家服/卸颜/居家真实/不适用 中选一\n");
        sb.append("  - audio: 达人原声/专业旁白/无人声 中选一\n");
        sb.append("  - skinType: 干皮敏感/混油/暗沉/毛孔/痘肌/正常肌/混油皮/不适用 中选一\n");
        sb.append("  - trending: 热点关键词（可空字符串）\n\n");

        sb.append("【分片建议】视频总时长 ").append(durationSec).append(" 秒，");
        sb.append("请根据视觉内容、话术切换点合理划分片段，每片段建议2-8秒，不要过细或过粗。\n\n");

        sb.append("【视频信息】\n");
        sb.append("SKU=").append(safe(request.getSkuId())).append("\n");
        sb.append("文件名=").append(safe(request.getSourceName())).append("\n");
        sb.append("总时长=").append(durationSec).append("秒\n");

        if (request.getProductTruth() != null) {
            var pt = request.getProductTruth();
            sb.append("\n【商品背景】\n");
            sb.append("商品名：").append(safe(pt.getProductName())).append("\n");
            sb.append("核心卖点：").append(safe(pt.getCoreBenefits())).append("\n");
            sb.append("适用人群：").append(safe(pt.getTargetSkinType())).append("\n");
            sb.append("推荐场景：").append(safe(pt.getPreferredScenes())).append("\n");
            sb.append("禁用话术：").append(safe(pt.getForbiddenClaims())).append("\n");
        }

        return sb.toString();
    }

    private List<VideoUnderstandingAnalyzer.VideoSegment> extractSegments(JsonNode root) {
        JsonNode node = root.get("segments");
        if (node == null || !node.isArray()) {
            return List.of();
        }
        List<VideoUnderstandingAnalyzer.VideoSegment> result = new ArrayList<>();
        for (JsonNode seg : node) {
            try {
                VideoUnderstandingAnalyzer.VideoSegment segment = VideoUnderstandingAnalyzer.VideoSegment.builder()
                        .index(intVal(seg, "index"))
                        .startSec(intVal(seg, "startSec"))
                        .endSec(intVal(seg, "endSec"))
                        .structureTag(textVal(seg, "structureTag"))
                        .motivation(textVal(seg, "motivation"))
                        .technique(textVal(seg, "technique"))
                        .cameraLanguage(textVal(seg, "cameraLanguage"))
                        .scene(textVal(seg, "scene"))
                        .signalStrength(intVal(seg, "signalStrength"))
                        .keyPhrase(textVal(seg, "keyPhrase"))
                        .script(textVal(seg, "script"))
                        .sellingPoint(textVal(seg, "sellingPoint"))
                        .decisiveFrame(boolVal(seg, "decisiveFrame"))
                        .decisiveFrameDesc(textVal(seg, "decisiveFrameDesc"))
                        .influencerLevel(textVal(seg, "influencerLevel"))
                        .audiencePersona(textVal(seg, "audiencePersona"))
                        .bgm(textVal(seg, "bgm"))
                        .rhythm(textVal(seg, "rhythm"))
                        .wardrobe(textVal(seg, "wardrobe"))
                        .audio(textVal(seg, "audio"))
                        .skinType(textVal(seg, "skinType"))
                        .trending(textVal(seg, "trending"))
                        .build();
                result.add(segment);
            } catch (Exception e) {
                log.warn("片段解析失败，跳过: {}", e.getMessage());
            }
        }
        return result;
    }

    private int intVal(JsonNode node, String field) {
        JsonNode n = node.get(field);
        return n == null || n.isNull() ? 0 : n.asInt();
    }

    private boolean boolVal(JsonNode node, String field) {
        JsonNode n = node.get(field);
        return n != null && !n.isNull() && n.asBoolean();
    }

    private String textVal(JsonNode node, String field) {
        JsonNode n = node.get(field);
        return n == null || n.isNull() ? "" : n.asText();
    }

    private String extractChoiceText(JsonNode body) {
        JsonNode choices = body.get("choices");
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

    private void requireApiKey() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("方舟 API Key 未配置，请在 application-local.yaml 中配置 ark.api-key");
        }
    }

    private void ensureSuccess(int statusCode, String body, String action) {
        if (statusCode < 200 || statusCode >= 300) {
            String reason = sanitizeErrorBody(statusCode, body);
            throw new IllegalStateException(action + "失败，HTTP=" + statusCode + "，原因=" + reason);
        }
    }

    private String sanitizeErrorBody(int statusCode, String body) {
        if (statusCode == 401) {
            return "方舟鉴权失败，请检查 ark.api-key 配置";
        }
        if (body == null || body.isBlank()) {
            return "上游未返回错误详情";
        }
        String sanitized = body.replaceAll("[\\r\\n]+", " ").trim();
        if (sanitized.length() > 300) {
            sanitized = sanitized.substring(0, 300) + "...";
        }
        return sanitized;
    }

    private List<String> extractStringList(JsonNode root, String field) {
        JsonNode node = root.get(field);
        if (node == null || !node.isArray()) {
            return List.of();
        }
        List<String> result = new ArrayList<>();
        for (JsonNode item : node) {
            if (item.isTextual()) {
                result.add(item.asText());
            }
        }
        return result;
    }

    private List<Map<String, Object>> extractObjectList(JsonNode root, String field) {
        JsonNode node = root.get(field);
        if (node == null || !node.isArray()) {
            return List.of();
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (JsonNode item : node) {
            result.add(objectMapper.convertValue(item, Map.class));
        }
        return result;
    }

    private String extractText(JsonNode root, String field) {
        JsonNode node = root.get(field);
        return node == null || node.isNull() ? null : node.asText();
    }

    private String cleanJsonFence(String raw) {
        String t = raw.trim();
        if (t.startsWith("```")) {
            t = t.replaceFirst("^```[a-zA-Z0-9_-]*\\s*", "");
            t = t.replaceFirst("\\s*```$", "");
        }
        return t.trim();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String defaultIfBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String guessMimeType(Path path) {
        String name = path.getFileName().toString().toLowerCase(Locale.ROOT);
        return name.endsWith(".png") ? "image/png" : "image/jpeg";
    }
}
