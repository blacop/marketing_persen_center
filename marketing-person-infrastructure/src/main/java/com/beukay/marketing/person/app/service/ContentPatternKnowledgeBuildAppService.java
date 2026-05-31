package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.Operator;
import com.beukay.ai.common.exception.BadParameterException;
import com.beukay.marketing.person.domain.contentPatternKnowledge.ability.ContentPatternKnowledgeDomainService;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledge;
import com.beukay.marketing.person.domain.patternReferenceVideoRel.gateway.PatternReferenceVideoRelGateway;
import com.beukay.marketing.person.domain.patternReferenceVideoRel.model.PatternReferenceVideoRel;
import com.beukay.marketing.person.domain.productTruth.gateway.ProductTruthGateway;
import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.domain.videoDeconstructionResult.gateway.VideoDeconstructionResultGateway;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.beukay.marketing.person.infrastructure.service.SkuIdResolver;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.beukay.ai.common.exception.GenericBusinessException;
@Service
@RequiredArgsConstructor
public class ContentPatternKnowledgeBuildAppService {

    private static final Operator SYSTEM_OPERATOR = new Operator(0L, "system");

    private final ContentPatternKnowledgeDomainService contentPatternKnowledgeDomainService;
    private final VideoDeconstructionResultGateway videoDeconstructionResultGateway;
    private final ProductTruthGateway productTruthGateway;
    private final PatternReferenceVideoRelGateway patternReferenceVideoRelGateway;
    private final ObjectMapper objectMapper;
    private final SkuIdResolver skuIdResolver;

    @Transactional(rollbackFor = Exception.class)
    public List<ContentPatternKnowledge> aggregateBySku(String skuId, String marketingNode, String targetAudience) {
        String resolvedSkuId = skuIdResolver.resolve(skuId);
        ProductTruth truth = productTruthGateway.queryBySkuId(resolvedSkuId);
        if (truth == null) {
            throw new BadParameterException(skuIdResolver.buildNotFoundMessage(skuId, resolvedSkuId));
        }
        List<VideoDeconstructionResult> source = videoDeconstructionResultGateway.listBySkuId(resolvedSkuId).stream()
                .filter(this::isAvailable)
                .toList();
        if (source.isEmpty()) {
            throw new BadParameterException("未找到可聚合的视频拆解结果，原始入参=" + skuId + "，标准SKU=" + resolvedSkuId);
        }

        String resolvedMarketingNode = StringUtils.hasText(marketingNode) ? marketingNode : "日常投放";
        Map<String, List<VideoDeconstructionResult>> grouped = source.stream()
                .collect(Collectors.groupingBy(this::buildGroupKey, LinkedHashMap::new, Collectors.toList()));

        List<ContentPatternKnowledge> aggregated = new ArrayList<>();
        for (Map.Entry<String, List<VideoDeconstructionResult>> entry : grouped.entrySet()) {
            List<VideoDeconstructionResult> sortedGroup = entry.getValue().stream()
                    .sorted(Comparator.comparing(ContentPatternKnowledgeBuildAppService::safeScore).reversed()
                            .thenComparing(VideoDeconstructionResult::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                    .toList();
            VideoDeconstructionResult top = sortedGroup.getFirst();
            String knowledgeId = buildKnowledgeId(resolvedSkuId, resolvedMarketingNode, entry.getKey());
            List<String> sellingPoints = collectTopTags(sortedGroup, VideoDeconstructionResult::getSellingPointTags, 3);
            List<String> scenes = collectTopTags(sortedGroup, VideoDeconstructionResult::getSceneTags, 3);
            List<String> ctas = collectTopTags(sortedGroup, VideoDeconstructionResult::getCtaTags, 3);
            List<String> audienceTags = collectTopTags(sortedGroup, VideoDeconstructionResult::getTargetAudienceTags, 3);
            String resolvedAudience = StringUtils.hasText(targetAudience)
                    ? targetAudience
                    : String.join("/", audienceTags.isEmpty() ? parseJsonArray(truth.getTargetSkinType()) : audienceTags);
            List<String> negativeRules = buildNegativeRules(truth, sellingPoints, audienceTags);

            ContentPatternKnowledge existing = contentPatternKnowledgeDomainService.queryByKnowledgeId(knowledgeId);
            ContentPatternKnowledge knowledge = ContentPatternKnowledge.builder()
                    .id(existing != null ? existing.getId() : null)
                    .knowledgeId(knowledgeId)
                    .skuId(resolvedSkuId)
                    .skuTag(top.getSkuTag())
                    .marketingNode(resolvedMarketingNode)
                    .targetAudience(resolvedAudience)
                    .hookType(top.getHookType())
                    .patternType(top.getTitlePattern())
                    .recommendedOpening(extractOpening(top))
                    .recommendedSellingPoints(writeJson(sellingPoints))
                    .recommendedCta(writeJson(ctas))
                    .recommendedScenes(writeJson(scenes))
                    .negativeRules(writeJson(negativeRules))
                    .patternScore(averageScore(sortedGroup))
                    .actualPerformanceScore(safeScore(top))
                    .patternEmbedding(null)
                    .knowledgeJson(buildKnowledgeJson(top, sortedGroup, resolvedMarketingNode, resolvedAudience, sellingPoints, scenes, ctas, negativeRules))
                    .version("v1")
                    .verificationStatus("PENDING")
                    .status("ENABLED")
                    .build();

            if (existing == null) {
                knowledge.buildInsert(SYSTEM_OPERATOR);
                Long id = contentPatternKnowledgeDomainService.create(knowledge);
                knowledge.setId(id);
            } else {
                knowledge.setBaseFields(existing.getBaseFields());
                knowledge.buildUpdate(SYSTEM_OPERATOR);
                contentPatternKnowledgeDomainService.update(knowledge);
            }

            patternReferenceVideoRelGateway.softDeleteByKnowledgeId(knowledgeId);
            createReferenceRelations(knowledgeId, sortedGroup);
            aggregated.add(knowledge);
        }
        return aggregated.stream()
                .sorted(Comparator.comparing(ContentPatternKnowledge::getPatternScore, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    private void createReferenceRelations(String knowledgeId, List<VideoDeconstructionResult> sortedGroup) {
        for (int i = 0; i < Math.min(sortedGroup.size(), 3); i++) {
            VideoDeconstructionResult result = sortedGroup.get(i);
            PatternReferenceVideoRel rel = PatternReferenceVideoRel.builder()
                    .knowledgeId(knowledgeId)
                    .videoId(result.getVideoId())
                    .recordId(result.getRecordId())
                    .relationType(i == 0 ? "PRIMARY" : "SECONDARY")
                    .referenceScore(safeScore(result))
                    .actualPerformanceScore(safeScore(result))
                    .build();
            rel.buildInsert(SYSTEM_OPERATOR);
            patternReferenceVideoRelGateway.create(rel);
        }
    }

    private boolean isAvailable(VideoDeconstructionResult result) {
        return !"REJECTED".equalsIgnoreCase(result.getVerificationStatus())
                && !"DISABLED".equalsIgnoreCase(result.getStatus());
    }

    private String buildGroupKey(VideoDeconstructionResult result) {
        return String.join("|",
                defaultValue(result.getHookType()),
                defaultValue(result.getTitlePattern()));
    }

    private String buildKnowledgeId(String skuId, String marketingNode, String groupKey) {
        String seed = skuId + "|" + marketingNode + "|" + groupKey;
        return "cpk-" + UUID.nameUUIDFromBytes(seed.getBytes(StandardCharsets.UTF_8)).toString().replace("-", "");
    }

    private List<String> collectTopTags(List<VideoDeconstructionResult> source,
                                        Function<VideoDeconstructionResult, String> extractor,
                                        int limit) {
        Map<String, Long> frequency = new LinkedHashMap<>();
        for (VideoDeconstructionResult item : source) {
            for (String tag : parseJsonArray(extractor.apply(item))) {
                frequency.merge(tag, 1L, Long::sum);
            }
        }
        return frequency.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed()
                        .thenComparing(Map.Entry::getKey))
                .limit(limit)
                .map(Map.Entry::getKey)
                .toList();
    }

    private String extractOpening(VideoDeconstructionResult top) {
        String title = extractTitle(top);
        if (!StringUtils.hasText(title)) {
            return defaultValue(top.getHookType()) + "开场";
        }
        int splitIndex = title.length();
        for (String token : List.of("！", "?", "？", "，", ",", "。", " ")) {
            int index = title.indexOf(token);
            if (index > 0) {
                splitIndex = Math.min(splitIndex, index);
            }
        }
        return title.substring(0, Math.min(splitIndex, 18));
    }

    private String extractTitle(VideoDeconstructionResult top) {
        if (!StringUtils.hasText(top.getDeconstructionJson())) {
            return null;
        }
        try {
            Map<String, Object> json = objectMapper.readValue(top.getDeconstructionJson(), new TypeReference<Map<String, Object>>() { });
            Object title = json.get("title");
            return title == null ? null : String.valueOf(title);
        } catch (Exception ex) {
            return null;
        }
    }

    private BigDecimal averageScore(List<VideoDeconstructionResult> source) {
        BigDecimal total = source.stream()
                .map(ContentPatternKnowledgeBuildAppService::safeScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(source.size()), 6, RoundingMode.HALF_UP);
    }

    private List<String> buildNegativeRules(ProductTruth truth, List<String> sellingPoints, List<String> audienceTags) {
        LinkedHashSet<String> rules = new LinkedHashSet<>(parseJsonArray(truth.getForbiddenClaims()));
        boolean drySkinAudience = audienceTags.stream().anyMatch(tag -> tag.contains("干皮"));
        boolean containsStrongOilControl = sellingPoints.stream().anyMatch(tag -> tag.contains("控油"));
        if (drySkinAudience && containsStrongOilControl) {
            rules.add("避免只强调强控油，优先表达持妆服帖与干皮友好");
        }
        return new ArrayList<>(rules);
    }

    private String buildKnowledgeJson(VideoDeconstructionResult top,
                                      List<VideoDeconstructionResult> group,
                                      String marketingNode,
                                      String targetAudience,
                                      List<String> sellingPoints,
                                      List<String> scenes,
                                      List<String> ctas,
                                      List<String> negativeRules) {
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("marketingNode", marketingNode);
        json.put("targetAudience", targetAudience);
        json.put("hookType", top.getHookType());
        json.put("patternType", top.getTitlePattern());
        json.put("referenceRecordIds", group.stream().limit(3).map(VideoDeconstructionResult::getRecordId).toList());
        json.put("referenceVideoIds", group.stream().limit(3).map(VideoDeconstructionResult::getVideoId).toList());
        json.put("recommendedSellingPoints", sellingPoints);
        json.put("recommendedScenes", scenes);
        json.put("recommendedCta", ctas);
        json.put("negativeRules", negativeRules);
        json.put("logicTrace", "aggregate-by-hookType-titlePattern");
        return writeJson(json);
    }

    private List<String> parseJsonArray(String json) {
        if (!StringUtils.hasText(json)) {
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
            throw new GenericBusinessException("内容模式知识JSON序列化失败" + ": " + e.getMessage());
        }
    }

    private String defaultValue(String value) {
        return StringUtils.hasText(value) ? value : "UNKNOWN";
    }

    private static BigDecimal safeScore(VideoDeconstructionResult result) {
        return result.getActualPerformanceScore() == null ? BigDecimal.ZERO : result.getActualPerformanceScore();
    }
}
