package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.Operator;
import com.beukay.ai.common.exception.BadParameterException;
import com.beukay.marketing.person.domain.contentPatternKnowledge.gateway.ContentPatternKnowledgeGateway;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledge;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledgeListCriteriaQuery;
import com.beukay.marketing.person.domain.contentStructureCard.ability.ContentStructureCardDomainService;
import com.beukay.marketing.person.domain.contentStructureCard.model.ContentStructureCard;
import com.beukay.marketing.person.domain.patternReferenceVideoRel.gateway.PatternReferenceVideoRelGateway;
import com.beukay.marketing.person.domain.patternReferenceVideoRel.model.PatternReferenceVideoRel;
import com.beukay.marketing.person.domain.productTruth.gateway.ProductTruthGateway;
import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.infrastructure.service.SkuIdResolver;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
public class ContentStructureCardGenerateAppService {

    private static final Operator SYSTEM_OPERATOR = new Operator(0L, "system");
    private static final String CARD_VERSION = "1.1";
    private static final int DEFAULT_VIDEO_DURATION_SEC = 60;

    private final ContentStructureCardDomainService contentStructureCardDomainService;
    private final ContentPatternKnowledgeGateway contentPatternKnowledgeGateway;
    private final PatternReferenceVideoRelGateway patternReferenceVideoRelGateway;
    private final ProductTruthGateway productTruthGateway;
    private final ObjectMapper objectMapper;
    private final SkuIdResolver skuIdResolver;

    @Transactional(rollbackFor = Exception.class)
    public ContentStructureCard generate(String skuId, String marketingNode, String targetAudience, String accountId) {
        String resolvedSkuId = skuIdResolver.resolve(skuId);
        ProductTruth truth = productTruthGateway.queryBySkuId(resolvedSkuId);
        if (truth == null) {
            throw new BadParameterException(skuIdResolver.buildNotFoundMessage(skuId, resolvedSkuId));
        }

        String resolvedNode = StringUtils.hasText(marketingNode) ? marketingNode : "日常投放";
        String resolvedAudience = StringUtils.hasText(targetAudience) ? targetAudience : "";

        List<ContentPatternKnowledge> patterns = contentPatternKnowledgeGateway.listPage(
                ContentPatternKnowledgeListCriteriaQuery.builder()
                        .skuId(resolvedSkuId)
                        .marketingNode(resolvedNode)
                        .build(),
                com.beukay.ai.common.entity.PageQuery.builder().pageIndex(1L).pageSize(10L).build()
        ).getRecords();

        if (patterns == null || patterns.isEmpty()) {
            throw new BadParameterException("无可用知识模式，请先执行 aggregate，原始入参=" + skuId + "，标准SKU=" + resolvedSkuId);
        }

        ContentPatternKnowledge topPattern = patterns.stream()
                .max((a, b) -> {
                    BigDecimal sa = a.getPatternScore() != null ? a.getPatternScore() : BigDecimal.ZERO;
                    BigDecimal sb = b.getPatternScore() != null ? b.getPatternScore() : BigDecimal.ZERO;
                    return sa.compareTo(sb);
                })
                .orElseThrow();

        List<PatternReferenceVideoRel> refs = patternReferenceVideoRelGateway.listByKnowledgeId(topPattern.getKnowledgeId());
        String topRefVideoId = refs.isEmpty() ? null : refs.get(0).getVideoId();

        List<String> sellingPoints = parseJsonArray(topPattern.getRecommendedSellingPoints());
        List<String> scenes = parseJsonArray(topPattern.getRecommendedScenes());
        List<String> ctaList = parseJsonArray(topPattern.getRecommendedCta());
        List<String> negative = parseJsonArray(topPattern.getNegativeRules());
        List<String> coreBenefits = parseJsonArray(truth.getCoreBenefits());
        List<String> forbidden = parseJsonArray(truth.getForbiddenClaims());

        String opening = StringUtils.hasText(topPattern.getRecommendedOpening())
                ? topPattern.getRecommendedOpening()
                : (coreBenefits.isEmpty() ? "" : coreBenefits.get(0));

        Map<String, Object> cardJsonMap = new LinkedHashMap<>();
        cardJsonMap.put("skuId", resolvedSkuId);
        cardJsonMap.put("skuTag", topPattern.getSkuTag());
        cardJsonMap.put("marketingNode", resolvedNode);
        cardJsonMap.put("targetAudience", resolvedAudience);
        cardJsonMap.put("hookType", topPattern.getHookType());
        cardJsonMap.put("patternType", topPattern.getPatternType());
        cardJsonMap.put("openingHook", opening);
        cardJsonMap.put("recommendedSellingPoints", sellingPoints);
        cardJsonMap.put("recommendedScenes", scenes);
        cardJsonMap.put("recommendedCta", ctaList);
        cardJsonMap.put("negativeRules", negative);
        cardJsonMap.put("coreBenefits", coreBenefits);
        cardJsonMap.put("forbiddenClaims", forbidden);
        cardJsonMap.put("referenceVideoId", topRefVideoId);
        cardJsonMap.put("videoDurationSec", DEFAULT_VIDEO_DURATION_SEC);
        cardJsonMap.put("patternScore", topPattern.getPatternScore());
        cardJsonMap.put("knowledgeId", topPattern.getKnowledgeId());

        Map<String, Object> logicTrace = new LinkedHashMap<>();
        logicTrace.put("selectedKnowledgeId", topPattern.getKnowledgeId());
        logicTrace.put("selectedHookType", topPattern.getHookType());
        logicTrace.put("selectedPatternType", topPattern.getPatternType());
        logicTrace.put("patternScore", topPattern.getPatternScore());
        logicTrace.put("candidateCount", patterns.size());
        logicTrace.put("referenceVideoId", topRefVideoId);
        logicTrace.put("generationStrategy", "top-pattern-by-score");

        String cardJsonStr = toJson(cardJsonMap);
        String logicTraceStr = toJson(logicTrace);
        String cardId = "csc-" + UUID.randomUUID().toString().replace("-", "");

        ContentStructureCard card = ContentStructureCard.builder()
                .cardId(cardId)
                .cardVersion(CARD_VERSION)
                .skuId(resolvedSkuId)
                .hookType(topPattern.getHookType())
                .targetAudience(resolvedAudience)
                .marketingNode(resolvedNode)
                .accountId(accountId)
                .status("DRAFT")
                .cardJson(cardJsonStr)
                .openingHook(opening)
                .videoDurationSec(DEFAULT_VIDEO_DURATION_SEC)
                .referenceVideoId(topRefVideoId)
                .patternRankTop1(topPattern.getPatternType())
                .logicTrace(logicTraceStr)
                .build();

        card.buildInsert(SYSTEM_OPERATOR);
        Long id = contentStructureCardDomainService.create(card);
        card.setId(id);
        log.info("ContentStructureCard generated: cardId={} hookType={} patternType={} score={}",
                cardId, topPattern.getHookType(), topPattern.getPatternType(), topPattern.getPatternScore());
        return card;
    }

    private List<String> parseJsonArray(String json) {
        if (!StringUtils.hasText(json)) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
}
