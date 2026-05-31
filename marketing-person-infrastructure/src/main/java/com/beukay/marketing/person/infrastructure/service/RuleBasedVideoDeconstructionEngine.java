package com.beukay.marketing.person.infrastructure.service;

import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.beukay.marketing.person.domain.videoPerformanceRecord.model.VideoPerformanceRecord;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class RuleBasedVideoDeconstructionEngine {

    private final ObjectMapper objectMapper;

    public VideoDeconstructionResult build(VideoPerformanceRecord record, ProductTruth truth) {
        return analyze(record, truth).result();
    }

    public PatternAnalysis analyze(VideoPerformanceRecord record, ProductTruth truth) {
        String title = record.getTitle() == null ? "" : record.getTitle();
        List<String> preferredScenes = parseJsonArray(truth.getPreferredScenes());
        List<String> evidencePoints = parseJsonArray(truth.getEvidencePoints());
        List<String> targetSkinTypes = parseJsonArray(truth.getTargetSkinType());
        List<String> promotionMechanisms = parseJsonArray(truth.getPromotionMechanisms());
        List<String> forbiddenClaims = parseJsonArray(truth.getForbiddenClaims());

        List<String> sceneTags = extractSceneTags(title, preferredScenes);
        List<String> sellingPointTags = extractSellingPointTags(title, evidencePoints);
        List<String> ctaTags = extractCtaTags(title, promotionMechanisms);
        List<String> emotionTags = extractEmotionTags(title);
        List<String> audienceTags = extractAudienceTags(title, targetSkinTypes);
        String titlePattern = resolveTitlePattern(title);
        String hookType = resolveHookType(record, title);
        PatternDecision patternDecision = resolvePatternDecision(record, title, hookType, titlePattern,
                sceneTags, sellingPointTags, ctaTags, emotionTags);

        Map<String, Object> json = new LinkedHashMap<>();
        json.put("recordId", record.getId());
        json.put("videoId", record.getVideoId());
        json.put("title", record.getTitle());
        json.put("hookType", hookType);
        json.put("titlePattern", titlePattern);
        json.put("sceneTags", sceneTags);
        json.put("sellingPointTags", sellingPointTags);
        json.put("ctaTags", ctaTags);
        json.put("emotionTags", emotionTags);
        json.put("targetAudienceTags", audienceTags);
        json.put("forbiddenClaims", forbiddenClaims);
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("views", record.getViews());
        metrics.put("completionRate", record.getCompletionRate());
        metrics.put("avgWatchSec", record.getAvgWatchSec());
        metrics.put("liveGmv", record.getLiveGmv());
        metrics.put("liveTraffic", record.getLiveTraffic());
        metrics.put("liveOrders", record.getLiveOrders());
        metrics.put("postSearchGmv", record.getPostSearchGmv());
        metrics.put("compositeScore", record.getCompositeScore());
        json.put("sourceMetrics", metrics);
        json.put("reasoning", buildReasoning(hookType, titlePattern, sceneTags, sellingPointTags, ctaTags));
        json.put("patternCandidates", patternDecision.candidates().stream().map(this::toPatternCandidateJson).toList());
        json.put("recommendedPatternCode", patternDecision.recommended().patternCode());
        json.put("recommendedPatternName", patternDecision.recommended().patternName());
        json.put("recommendedPatternReason", patternDecision.recommended().reason());

        VideoDeconstructionResult result = VideoDeconstructionResult.builder()
                .recordId(record.getId())
                .videoId(record.getVideoId())
                .skuId(truth.getSkuId())
                .skuTag(record.getSkuTag())
                .hookType(hookType)
                .sceneTags(writeJson(sceneTags))
                .sellingPointTags(writeJson(sellingPointTags))
                .ctaTags(writeJson(ctaTags))
                .titlePattern(titlePattern)
                .emotionTags(writeJson(emotionTags))
                .targetAudienceTags(writeJson(audienceTags))
                .recommendedPatternCode(patternDecision.recommended().patternCode())
                .recommendedPatternName(patternDecision.recommended().patternName())
                .recommendedPatternReason(patternDecision.recommended().reason())
                .patternDecisionJson(writeJson(toPatternDecisionJson(patternDecision)))
                .deconstructionJson(writeJson(json))
                .version("v1")
                .actualPerformanceScore(record.getCompositeScore() == null ? BigDecimal.ZERO : record.getCompositeScore())
                .verificationStatus("PENDING")
                .status("ENABLED")
                .build();
        return new PatternAnalysis(result, patternDecision);
    }

    private String resolveHookType(VideoPerformanceRecord record, String title) {
        if (record.getHookType() != null && !record.getHookType().isBlank()) {
            return record.getHookType();
        }
        if (containsAny(title, "谁懂", "服气", "巨巨巨", "太好看", "心动")) {
            return "情绪共鸣型";
        }
        if (containsAny(title, "长白山", "旅游", "早八", "约会", "蹭不掉", "春")) {
            return "场景植入型";
        }
        if (containsAny(title, "24小时", "14小时", "控油", "持妆", "遮瑕", "柔焦", "服帖", "通透")) {
            return "技术卖点型";
        }
        if (containsAny(title, "林枫松", "陈稳", "枫稳", "明星同款", "品牌大使")) {
            return "明星背书型";
        }
        if (containsAny(title, "买1发", "拍1发", "4个", "福利", "免费试用", "抽")) {
            return "价格机制型";
        }
        return "其他";
    }

    private String resolveTitlePattern(String title) {
        if (containsAny(title, "谁懂", "吗", "?", "？")) {
            return "EMOTION_QUESTION";
        }
        if (containsAny(title, "24小时", "14小时", "微米级", "遮瑕", "控油", "持妆")) {
            return "TECHNICAL_PROOF";
        }
        if (containsAny(title, "长白山", "旅游", "早八", "约会", "踏青", "出门")) {
            return "SCENE_SEEDING";
        }
        if (containsAny(title, "买1发", "拍1发", "4个", "免费试用", "抽", "福利")) {
            return "OFFER_MECHANISM";
        }
        if (containsAny(title, "林枫松", "陈稳", "枫稳", "明星同款", "品牌大使")) {
            return "CELEBRITY_ENDORSEMENT";
        }
        return "GENERAL_SEEDING";
    }

    private List<String> extractSceneTags(String title, List<String> preferredScenes) {
        Set<String> result = new LinkedHashSet<>();
        addIfContains(title, result, "长白山", "旅游");
        addIfContains(title, result, "旅游", "旅游");
        addIfContains(title, result, "早八", "早八");
        addIfContains(title, result, "通勤", "通勤");
        addIfContains(title, result, "约会", "约会");
        addIfContains(title, result, "春", "踏青");
        for (String scene : preferredScenes) {
            if (title.contains(scene)) {
                result.add(scene);
            }
        }
        if (result.isEmpty() && !preferredScenes.isEmpty()) {
            result.add(preferredScenes.get(0));
        }
        return new ArrayList<>(result);
    }

    private List<String> extractSellingPointTags(String title, List<String> evidencePoints) {
        Set<String> result = new LinkedHashSet<>();
        if (containsAny(title, "24小时", "持妆")) {
            addMatchingEvidence(result, evidencePoints, "24小时持妆", "持妆");
        }
        if (containsAny(title, "14小时", "控油")) {
            addMatchingEvidence(result, evidencePoints, "14小时控油", "控油");
        }
        if (containsAny(title, "微米级", "蝉翼", "轻薄", "服帖", "通透")) {
            addMatchingEvidence(result, evidencePoints, "微米级粉体薄如蝉翼", "轻薄");
        }
        if (containsAny(title, "遮瑕", "无暇", "柔焦")) {
            addMatchingEvidence(result, evidencePoints, "遮瑕力强", "遮瑕");
        }
        if (containsAny(title, "养肤", "种子精华")) {
            addMatchingEvidence(result, evidencePoints, "养肤成分", "养肤");
        }
        if (result.isEmpty() && !evidencePoints.isEmpty()) {
            result.add(evidencePoints.get(0));
        }
        return new ArrayList<>(result);
    }

    private List<String> extractCtaTags(String title, List<String> promotionMechanisms) {
        Set<String> result = new LinkedHashSet<>();
        addIfContains(title, result, "直播间", "直播间福利");
        addIfContains(title, result, "买1发", "买1发N");
        addIfContains(title, result, "拍1发", "拍1发N");
        addIfContains(title, result, "免费试用", "免费试用");
        addIfContains(title, result, "抽", "抽奖福利");
        for (String mechanism : promotionMechanisms) {
            if (title.contains(mechanism) || mechanism.contains("直播间") && title.contains("直播间")) {
                result.add(mechanism);
            }
        }
        if (result.isEmpty() && !promotionMechanisms.isEmpty()) {
            result.add(promotionMechanisms.get(0));
        }
        return new ArrayList<>(result);
    }

    private List<String> extractEmotionTags(String title) {
        Set<String> result = new LinkedHashSet<>();
        addIfContains(title, result, "谁懂", "谁懂体");
        addIfContains(title, result, "服气", "服气体");
        addIfContains(title, result, "太好看", "惊艳");
        addIfContains(title, result, "巨巨巨", "强情绪夸张");
        addIfContains(title, result, "心动", "种草心动");
        return new ArrayList<>(result);
    }

    private List<String> extractAudienceTags(String title, List<String> targetSkinTypes) {
        Set<String> result = new LinkedHashSet<>();
        for (String skinType : targetSkinTypes) {
            if (title.contains(skinType)) {
                result.add(skinType);
            }
        }
        addIfContains(title, result, "新手", "新手");
        addIfContains(title, result, "学生", "学生党");
        addIfContains(title, result, "职场", "职场人群");
        if (result.isEmpty() && !targetSkinTypes.isEmpty()) {
            result.addAll(targetSkinTypes);
        }
        return new ArrayList<>(result);
    }

    private String buildReasoning(String hookType, String titlePattern, List<String> sceneTags,
                                  List<String> sellingPointTags, List<String> ctaTags) {
        return String.format(Locale.ROOT,
                "基于标题与历史表现规则判定 hookType=%s，titlePattern=%s，sceneTags=%s，sellingPointTags=%s，ctaTags=%s",
                hookType, titlePattern, sceneTags, sellingPointTags, ctaTags);
    }

    private PatternDecision resolvePatternDecision(VideoPerformanceRecord record,
                                                   String title,
                                                   String hookType,
                                                   String titlePattern,
                                                   List<String> sceneTags,
                                                   List<String> sellingPointTags,
                                                   List<String> ctaTags,
                                                   List<String> emotionTags) {
        List<PatternCandidateSnapshot> candidates = new ArrayList<>();
        candidates.add(buildTechSellingCandidate(record, title, hookType, titlePattern, sellingPointTags));
        candidates.add(buildSceneSeedingCandidate(record, title, hookType, titlePattern, sceneTags));
        candidates.add(buildEmotionalCandidate(title, hookType, titlePattern, emotionTags));
        candidates.add(buildOfferCandidate(title, hookType, titlePattern, ctaTags));
        candidates.add(buildCelebrityCandidate(title, hookType, titlePattern));
        candidates.add(buildGeneralCandidate(title, sellingPointTags, sceneTags));

        List<PatternCandidateSnapshot> ranked = candidates.stream()
                .filter(candidate -> candidate.score().compareTo(BigDecimal.ZERO) > 0)
                .sorted(Comparator.comparing(PatternCandidateSnapshot::score).reversed()
                        .thenComparing(PatternCandidateSnapshot::patternCode))
                .limit(3)
                .map(this::normalizeReason)
                .toList();
        if (ranked.isEmpty()) {
            ranked = List.of(normalizeReason(buildGeneralCandidate(title, sellingPointTags, sceneTags)));
        }
        return new PatternDecision(ranked, ranked.getFirst());
    }

    private PatternCandidateSnapshot buildTechSellingCandidate(VideoPerformanceRecord record,
                                                               String title,
                                                               String hookType,
                                                               String titlePattern,
                                                               List<String> sellingPointTags) {
        int hits = keywordHits(title, "24小时", "14小时", "控油", "持妆", "遮瑕", "柔焦", "服帖", "通透", "微米级");
        BigDecimal score = weightedScore(hits, "技术卖点型".equals(hookType), "TECHNICAL_PROOF".equals(titlePattern),
                sellingPointTags.size(), record.getCompositeScore());
        List<String> reasons = new ArrayList<>(sellingPointTags);
        if ("技术卖点型".equals(hookType)) {
            reasons.add("hookType命中技术卖点型");
        }
        if ("TECHNICAL_PROOF".equals(titlePattern)) {
            reasons.add("titlePattern命中TECHNICAL_PROOF");
        }
        return new PatternCandidateSnapshot("TECH_SELLING", "技术卖点型", score, reasons);
    }

    private PatternCandidateSnapshot buildSceneSeedingCandidate(VideoPerformanceRecord record,
                                                                String title,
                                                                String hookType,
                                                                String titlePattern,
                                                                List<String> sceneTags) {
        int hits = keywordHits(title, "长白山", "旅游", "早八", "约会", "踏青", "出门", "通勤");
        BigDecimal score = weightedScore(hits, "场景植入型".equals(hookType), "SCENE_SEEDING".equals(titlePattern),
                sceneTags.size(), record.getCompositeScore());
        List<String> reasons = new ArrayList<>(sceneTags);
        if ("场景植入型".equals(hookType)) {
            reasons.add("hookType命中场景植入型");
        }
        if ("SCENE_SEEDING".equals(titlePattern)) {
            reasons.add("titlePattern命中SCENE_SEEDING");
        }
        return new PatternCandidateSnapshot("SCENE_SEEDING", "场景植入型", score, reasons);
    }

    private PatternCandidateSnapshot buildEmotionalCandidate(String title,
                                                             String hookType,
                                                             String titlePattern,
                                                             List<String> emotionTags) {
        int hits = keywordHits(title, "谁懂", "服气", "巨巨巨", "太好看", "心动", "吗", "?", "？");
        BigDecimal score = weightedScore(hits, "情绪共鸣型".equals(hookType), "EMOTION_QUESTION".equals(titlePattern),
                emotionTags.size(), null);
        List<String> reasons = new ArrayList<>(emotionTags);
        if ("情绪共鸣型".equals(hookType)) {
            reasons.add("hookType命中情绪共鸣型");
        }
        if ("EMOTION_QUESTION".equals(titlePattern)) {
            reasons.add("titlePattern命中EMOTION_QUESTION");
        }
        return new PatternCandidateSnapshot("EMOTIONAL_RESONANCE", "情绪共鸣型", score, reasons);
    }

    private PatternCandidateSnapshot buildOfferCandidate(String title,
                                                         String hookType,
                                                         String titlePattern,
                                                         List<String> ctaTags) {
        int hits = keywordHits(title, "买1发", "拍1发", "4个", "福利", "免费试用", "抽", "直播间");
        BigDecimal score = weightedScore(hits, "价格机制型".equals(hookType), "OFFER_MECHANISM".equals(titlePattern),
                ctaTags.size(), null);
        List<String> reasons = new ArrayList<>(ctaTags);
        if ("价格机制型".equals(hookType)) {
            reasons.add("hookType命中价格机制型");
        }
        if ("OFFER_MECHANISM".equals(titlePattern)) {
            reasons.add("titlePattern命中OFFER_MECHANISM");
        }
        return new PatternCandidateSnapshot("OFFER_MECHANISM", "价格机制型", score, reasons);
    }

    private PatternCandidateSnapshot buildCelebrityCandidate(String title,
                                                             String hookType,
                                                             String titlePattern) {
        int hits = keywordHits(title, "林枫松", "陈稳", "枫稳", "明星同款", "品牌大使");
        BigDecimal score = weightedScore(hits, "明星背书型".equals(hookType), "CELEBRITY_ENDORSEMENT".equals(titlePattern),
                hits, null);
        List<String> reasons = new ArrayList<>();
        if (hits > 0) {
            reasons.add("标题含明星/达人背书关键词");
        }
        if ("明星背书型".equals(hookType)) {
            reasons.add("hookType命中明星背书型");
        }
        if ("CELEBRITY_ENDORSEMENT".equals(titlePattern)) {
            reasons.add("titlePattern命中CELEBRITY_ENDORSEMENT");
        }
        return new PatternCandidateSnapshot("CELEBRITY_ENDORSEMENT", "明星背书型", score, reasons);
    }

    private PatternCandidateSnapshot buildGeneralCandidate(String title,
                                                           List<String> sellingPointTags,
                                                           List<String> sceneTags) {
        BigDecimal score = BigDecimal.valueOf(0.2D + Math.min(0.5D,
                (sellingPointTags.size() + sceneTags.size()) * 0.1D)).setScale(6, RoundingMode.HALF_UP);
        List<String> reasons = new ArrayList<>();
        reasons.add("作为泛种草兜底模式");
        if (!title.isBlank()) {
            reasons.add("标题存在可用表达语义");
        }
        return new PatternCandidateSnapshot("GENERAL_SEEDING", "泛种草型", score, reasons);
    }

    private PatternCandidateSnapshot normalizeReason(PatternCandidateSnapshot candidate) {
        if (candidate.reasons().isEmpty()) {
            return new PatternCandidateSnapshot(candidate.patternCode(), candidate.patternName(), candidate.score(),
                    List.of(candidate.patternName() + "综合得分最高"));
        }
        return new PatternCandidateSnapshot(candidate.patternCode(), candidate.patternName(), candidate.score(), candidate.reasons());
    }

    private int keywordHits(String text, String... keywords) {
        int hits = 0;
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                hits++;
            }
        }
        return hits;
    }

    private BigDecimal weightedScore(int keywordHits,
                                     boolean hookMatched,
                                     boolean titlePatternMatched,
                                     int tagCount,
                                     BigDecimal performanceScore) {
        BigDecimal score = BigDecimal.valueOf(keywordHits * 0.18D + tagCount * 0.05D);
        if (hookMatched) {
            score = score.add(BigDecimal.valueOf(0.45D));
        }
        if (titlePatternMatched) {
            score = score.add(BigDecimal.valueOf(0.35D));
        }
        if (performanceScore != null && performanceScore.compareTo(BigDecimal.ZERO) > 0) {
            score = score.add(performanceScore.divide(BigDecimal.valueOf(1000), 6, RoundingMode.HALF_UP));
        }
        return score.setScale(6, RoundingMode.HALF_UP);
    }

    private Map<String, Object> toPatternCandidateJson(PatternCandidateSnapshot candidate) {
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("patternCode", candidate.patternCode());
        json.put("patternName", candidate.patternName());
        json.put("matchScore", candidate.score());
        json.put("reason", candidate.reason());
        return json;
    }

    private Map<String, Object> toPatternDecisionJson(PatternDecision decision) {
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("recommendedPatternCode", decision.recommended().patternCode());
        json.put("recommendedPatternName", decision.recommended().patternName());
        json.put("recommendedPatternReason", decision.recommended().reason());
        json.put("candidates", decision.candidates().stream().map(this::toPatternCandidateJson).toList());
        return json;
    }

    private List<String> parseJsonArray(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() { });
        } catch (Exception ex) {
            return List.of();
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("视频拆解JSON序列化失败", e);
        }
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private void addIfContains(String text, Set<String> sink, String keyword, String value) {
        if (text.contains(keyword)) {
            sink.add(value);
        }
    }

    private void addMatchingEvidence(Set<String> sink, List<String> evidencePoints, String preferred, String fallbackKeyword) {
        for (String evidencePoint : evidencePoints) {
            if (evidencePoint.contains(preferred) || evidencePoint.contains(fallbackKeyword)) {
                sink.add(evidencePoint);
                return;
            }
        }
        sink.add(preferred);
    }

    public record PatternDecision(List<PatternCandidateSnapshot> candidates,
                                  PatternCandidateSnapshot recommended) {
    }

    public record PatternAnalysis(VideoDeconstructionResult result,
                                  PatternDecision decision) {
    }

    public record PatternCandidateSnapshot(String patternCode,
                                           String patternName,
                                           BigDecimal score,
                                           List<String> reasons) {
        public String reason() {
            return String.join("；", reasons);
        }
    }
}
