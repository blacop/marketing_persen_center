package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.Operator;
import com.beukay.ai.common.exception.BadParameterException;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledge;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledgeListCriteriaQuery;
import com.beukay.marketing.person.domain.patternReferenceVideoRel.model.PatternReferenceVideoRel;
import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.domain.contentPatternKnowledge.gateway.ContentPatternKnowledgeGateway;
import com.beukay.marketing.person.domain.patternReferenceVideoRel.gateway.PatternReferenceVideoRelGateway;
import com.beukay.marketing.person.domain.productTruth.gateway.ProductTruthGateway;
import com.beukay.marketing.person.domain.scriptBlueprint.ability.ScriptBlueprintDomainService;
import com.beukay.marketing.person.domain.scriptBlueprint.gateway.ScriptBlueprintSectionGateway;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprint;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintSection;
import com.beukay.marketing.person.infrastructure.service.SkuIdResolver;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.beukay.ai.common.exception.GenericBusinessException;
@Service
@RequiredArgsConstructor
public class ScriptBlueprintGenerateAppService {

    private static final Operator SYSTEM_OPERATOR = new Operator(0L, "system");

    private final ScriptBlueprintDomainService scriptBlueprintDomainService;
    private final ScriptBlueprintSectionGateway scriptBlueprintSectionGateway;
    private final ContentPatternKnowledgeGateway contentPatternKnowledgeGateway;
    private final PatternReferenceVideoRelGateway patternReferenceVideoRelGateway;
    private final ProductTruthGateway productTruthGateway;
    private final ObjectMapper objectMapper;
    private final SkuIdResolver skuIdResolver;

    public ScriptBlueprint generate(String skuId, String marketingGoal, String marketingNode, String targetAudience, String platform, String accountId) {
        String resolvedSkuId = skuIdResolver.resolve(skuId);
        ProductTruth truth = productTruthGateway.queryBySkuId(resolvedSkuId);
        if (truth == null) {
            throw new BadParameterException(skuIdResolver.buildNotFoundMessage(skuId, resolvedSkuId));
        }

        String resolvedGoal = defaultText(marketingGoal, "SEEDING");
        String resolvedNode = defaultText(marketingNode, "日常投放");
        String resolvedAudience = defaultText(targetAudience, String.join("/", parseJsonArray(truth.getTargetSkinType())));
        String resolvedPlatform = defaultText(platform, "DOUYIN");
        String categoryCode = defaultText(truth.getCategory(), "GENERAL").toUpperCase();

        List<ContentPatternKnowledge> knowledgeList = contentPatternKnowledgeGateway.listPage(
                ContentPatternKnowledgeListCriteriaQuery.builder()
                        .skuId(resolvedSkuId)
                        .marketingNode(resolvedNode)
                        .build(),
                com.beukay.ai.common.entity.PageQuery.builder().pageIndex(1L).pageSize(10L).build()
        ).getRecords();
        if (knowledgeList == null || knowledgeList.isEmpty()) {
            throw new BadParameterException("无可用知识模式，请先执行 aggregate，原始入参=" + skuId + "，标准SKU=" + resolvedSkuId);
        }

        List<TemplateCandidate> candidates = knowledgeList.stream()
                .sorted(Comparator.comparing(ContentPatternKnowledge::getPatternScore, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(3)
                .map(knowledge -> toCandidate(knowledge, categoryCode, resolvedGoal, resolvedAudience))
                .sorted(Comparator.comparing(TemplateCandidate::matchScore).reversed())
                .toList();
        TemplateCandidate recommended = candidates.getFirst();

        String blueprintCode = "sbp-" + UUID.randomUUID().toString().replace("-", "");
        List<PatternReferenceVideoRel> refs = patternReferenceVideoRelGateway.listByKnowledgeId(recommended.knowledge().getKnowledgeId());
        List<ScriptBlueprintSection> sections = buildSections(blueprintCode, truth, recommended, refs, resolvedNode, resolvedAudience, resolvedPlatform);

        Map<String, Object> blueprintJson = new LinkedHashMap<>();
        blueprintJson.put("productName", defaultText(truth.getProductName(), resolvedSkuId));
        blueprintJson.put("categoryCode", categoryCode);
        blueprintJson.put("marketingGoal", resolvedGoal);
        blueprintJson.put("marketingNode", resolvedNode);
        blueprintJson.put("targetAudience", resolvedAudience);
        blueprintJson.put("platform", resolvedPlatform);
        blueprintJson.put("recommendedTemplateCode", recommended.templateCode());
        blueprintJson.put("sections", sections.stream().map(this::toSectionJson).toList());

        Map<String, Object> logicTrace = new LinkedHashMap<>();
        logicTrace.put("candidateTemplates", toCandidateJsonList(candidates, recommended));
        logicTrace.put("selectedKnowledgeId", recommended.knowledge().getKnowledgeId());
        logicTrace.put("selectedPatternType", recommended.knowledge().getPatternType());
        logicTrace.put("selectedHookType", recommended.knowledge().getHookType());
        logicTrace.put("referenceVideoIds", refs.stream().map(PatternReferenceVideoRel::getVideoId).toList());
        logicTrace.put("generationStrategy", "knowledge-to-blueprint-v1");

        ScriptBlueprint blueprint = ScriptBlueprint.builder()
                .blueprintCode(blueprintCode)
                .skuId(resolvedSkuId)
                .categoryCode(categoryCode)
                .marketingGoal(resolvedGoal)
                .marketingNode(resolvedNode)
                .targetAudience(resolvedAudience)
                .platform(resolvedPlatform)
                .accountId(accountId)
                .status("DRAFT")
                .blueprintSummary(defaultText(truth.getProductName(), resolvedSkuId) + " " + resolvedGoal + " 语义蓝图")
                .recommendedTemplateCode(recommended.templateCode())
                .recommendedTemplateName(recommended.templateName())
                .recommendedTemplateReason(recommended.reason())
                .templateCandidatesJson(writeJson(toCandidateJsonList(candidates, recommended)))
                .blueprintJson(writeJson(blueprintJson))
                .logicTrace(writeJson(logicTrace))
                .autoFlowStatus("READY_FOR_AGENT_C")
                .build();
        blueprint.buildInsert(SYSTEM_OPERATOR);
        Long id = scriptBlueprintDomainService.create(blueprint);
        blueprint.setId(id);

        sections.forEach(section -> section.buildInsert(SYSTEM_OPERATOR));
        scriptBlueprintSectionGateway.batchCreate(sections);
        return blueprint;
    }

    private List<ScriptBlueprintSection> buildSections(String blueprintCode,
                                                       ProductTruth truth,
                                                       TemplateCandidate recommended,
                                                       List<PatternReferenceVideoRel> refs,
                                                       String marketingNode,
                                                       String targetAudience,
                                                       String platform) {
        List<String> sellingPoints = parseJsonArray(recommended.knowledge().getRecommendedSellingPoints());
        List<String> scenes = parseJsonArray(recommended.knowledge().getRecommendedScenes());
        List<String> ctas = parseJsonArray(recommended.knowledge().getRecommendedCta());
        List<String> negativeRules = parseJsonArray(recommended.knowledge().getNegativeRules());
        List<String> coreBenefits = parseJsonArray(truth.getCoreBenefits());
        String productName = defaultText(truth.getProductName(), truth.getSkuId());
        String referenceVideoId = refs.isEmpty() ? "" : refs.getFirst().getVideoId();

        List<ScriptBlueprintSection> sections = new ArrayList<>();
        sections.add(buildSection(blueprintCode, 1, "HOOK", "开场破题", "快速抓住用户注意力",
                defaultText(recommended.knowledge().getRecommendedOpening(), productName + "先抛出核心结果"),
                productName + " " + defaultText(recommended.knowledge().getRecommendedOpening(), "开场钩子"),
                writeJson(List.of(defaultText(recommended.knowledge().getRecommendedOpening(), productName))),
                writeJson(List.of("高能开场", marketingNode, platform)),
                writeJson(negativeRules),
                3, 8,
                "先抛结论，再点出用户最在意的使用场景"));
        sections.add(buildSection(blueprintCode, 2, "SCENE", "场景痛点", "建立用户场景和痛点共鸣",
                "围绕" + String.join("、", scenes.isEmpty() ? List.of(marketingNode) : scenes) + "展开问题场景",
                productName + " " + String.join(" ", scenes.isEmpty() ? List.of(marketingNode) : scenes),
                writeJson(scenes.isEmpty() ? List.of(marketingNode) : scenes),
                writeJson(List.of(targetAudience, "场景共鸣")),
                writeJson(negativeRules),
                6, 12,
                "用用户口吻描述出门、通勤、上妆时最容易遇到的问题"));
        sections.add(buildSection(blueprintCode, 3, "BENEFIT", "方案卖点", "说明产品如何解决问题",
                "突出" + String.join("、", sellingPoints.isEmpty() ? coreBenefits : sellingPoints),
                productName + " " + String.join(" ", sellingPoints.isEmpty() ? coreBenefits : sellingPoints),
                writeJson(sellingPoints.isEmpty() ? coreBenefits : sellingPoints),
                writeJson(List.of(recommended.knowledge().getHookType(), recommended.knowledge().getPatternType())),
                writeJson(negativeRules),
                10, 20,
                "把卖点拆成用户能感知的效果，不要只读参数"));
        sections.add(buildSection(blueprintCode, 4, "PROOF_CTA", "证明收束", "给出证明并引导行动",
                "补充参考视频和CTA完成收束",
                productName + " " + referenceVideoId + " " + String.join(" ", ctas),
                writeJson(ctas.isEmpty() ? List.of("行动引导") : ctas),
                writeJson(List.of(referenceVideoId, "证明型片段", "收口")),
                writeJson(negativeRules),
                6, 12,
                "先给证明，再给CTA，形成完整收口"));
        return sections;
    }

    private ScriptBlueprintSection buildSection(String blueprintCode,
                                                int sectionNo,
                                                String stageCode,
                                                String stageName,
                                                String goal,
                                                String semanticIntent,
                                                String queryText,
                                                String mustCoverJson,
                                                String preferredSignalsJson,
                                                String avoidSignalsJson,
                                                int durationMin,
                                                int durationMax,
                                                String narrationHint) {
        return ScriptBlueprintSection.builder()
                .blueprintCode(blueprintCode)
                .sectionNo(sectionNo)
                .stageCode(stageCode)
                .stageName(stageName)
                .goal(goal)
                .semanticIntent(semanticIntent)
                .queryText(queryText)
                .mustCoverJson(mustCoverJson)
                .preferredSignalsJson(preferredSignalsJson)
                .avoidSignalsJson(avoidSignalsJson)
                .durationMin(durationMin)
                .durationMax(durationMax)
                .narrationHint(narrationHint)
                .build();
    }

    private TemplateCandidate toCandidate(ContentPatternKnowledge knowledge,
                                          String categoryCode,
                                          String marketingGoal,
                                          String targetAudience) {
        BigDecimal baseScore = knowledge.getPatternScore() == null ? BigDecimal.ZERO : knowledge.getPatternScore();
        BigDecimal audienceBonus = StringUtils.hasText(targetAudience) && StringUtils.hasText(knowledge.getTargetAudience())
                && targetAudience.contains(knowledge.getTargetAudience()) ? new BigDecimal("0.05") : BigDecimal.ZERO;
        String templateCode = categoryCode + "_" + marketingGoal + "_" + defaultText(knowledge.getPatternType(), "GENERAL").toUpperCase();
        String templateName = categoryCode + "-" + marketingGoal + "-" + defaultText(knowledge.getHookType(), "通用模板");
        return new TemplateCandidate(
                templateCode,
                templateName,
                baseScore.add(audienceBonus),
                "命中" + defaultText(knowledge.getHookType(), "通用") + " / " + defaultText(knowledge.getPatternType(), "GENERAL")
                        + "，patternScore=" + baseScore,
                knowledge
        );
    }

    private List<Map<String, Object>> toCandidateJsonList(List<TemplateCandidate> candidates, TemplateCandidate recommended) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < candidates.size(); i++) {
            result.add(toCandidateJson(candidates.get(i), i + 1, recommended.templateCode().equals(candidates.get(i).templateCode())));
        }
        return result;
    }

    private Map<String, Object> toCandidateJson(TemplateCandidate candidate, int rankNo, boolean recommended) {
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("templateCode", candidate.templateCode());
        json.put("templateName", candidate.templateName());
        json.put("matchScore", candidate.matchScore());
        json.put("reasonJson", candidate.reason());
        json.put("rankNo", rankNo);
        json.put("recommended", recommended);
        return json;
    }

    private Map<String, Object> toSectionJson(ScriptBlueprintSection section) {
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("sectionNo", section.getSectionNo());
        json.put("stageCode", section.getStageCode());
        json.put("stageName", section.getStageName());
        json.put("goal", section.getGoal());
        json.put("semanticIntent", section.getSemanticIntent());
        json.put("queryText", section.getQueryText());
        json.put("mustCoverJson", section.getMustCoverJson());
        json.put("preferredSignalsJson", section.getPreferredSignalsJson());
        json.put("avoidSignalsJson", section.getAvoidSignalsJson());
        json.put("durationMin", section.getDurationMin());
        json.put("durationMax", section.getDurationMax());
        json.put("narrationHint", section.getNarrationHint());
        return json;
    }

    private List<String> parseJsonArray(String json) {
        if (!StringUtils.hasText(json)) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception ex) {
            return List.of();
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new GenericBusinessException("ScriptBlueprint JSON序列化失败" + ": " + e.getMessage());
        }
    }

    private String defaultText(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }

    private record TemplateCandidate(String templateCode,
                                     String templateName,
                                     BigDecimal matchScore,
                                     String reason,
                                     ContentPatternKnowledge knowledge) {
    }
}
