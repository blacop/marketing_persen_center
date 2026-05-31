package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.contentPatternKnowledge.gateway.ContentPatternKnowledgeGateway;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledge;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledgeListCriteriaQuery;
import com.beukay.marketing.person.domain.patternReferenceVideoRel.gateway.PatternReferenceVideoRelGateway;
import com.beukay.marketing.person.domain.patternReferenceVideoRel.model.PatternReferenceVideoRel;
import com.beukay.marketing.person.domain.productTruth.gateway.ProductTruthGateway;
import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.domain.scriptBlueprint.ability.ScriptBlueprintDomainService;
import com.beukay.marketing.person.domain.scriptBlueprint.gateway.ScriptBlueprintSectionGateway;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprint;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintSection;
import com.beukay.marketing.person.infrastructure.service.SkuIdResolver;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ScriptBlueprintGenerateAppServiceTest {

    @Test
    void shouldGenerateSemanticBlueprintWithCandidateTemplates() throws Exception {
        InMemoryScriptBlueprintDomainService blueprintDomainService = new InMemoryScriptBlueprintDomainService();
        InMemoryScriptBlueprintSectionGateway sectionGateway = new InMemoryScriptBlueprintSectionGateway();
        ObjectMapper objectMapper = new ObjectMapper();

        ProductTruthGateway productTruthGateway = skuId -> ProductTruth.builder()
                .skuId("SEED_CUSHION_2")
                .productName("种籽气垫2.0")
                .category("FOUNDATION")
                .coreBenefits("[\"24小时持妆\",\"14小时控油\",\"微米级粉体\"]")
                .forbiddenClaims("[\"绝对不脱妆\"]")
                .preferredScenes("[\"早八\",\"通勤\",\"旅游\"]")
                .build();

        ContentPatternKnowledgeGateway knowledgeGateway = new ContentPatternKnowledgeGateway() {
            @Override
            public Long create(ContentPatternKnowledge knowledge) {
                throw new UnsupportedOperationException();
            }

            @Override
            public void update(ContentPatternKnowledge knowledge) {
                throw new UnsupportedOperationException();
            }

            @Override
            public ContentPatternKnowledge queryById(Long id) {
                return null;
            }

            @Override
            public ContentPatternKnowledge queryByKnowledgeId(String knowledgeId) {
                return null;
            }

            @Override
            public PageInfo<ContentPatternKnowledge> listPage(ContentPatternKnowledgeListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
                PageInfo<ContentPatternKnowledge> page = new PageInfo<>();
                page.setRecords(List.of(
                        ContentPatternKnowledge.builder()
                                .knowledgeId("cpk-tech")
                                .skuId("SEED_CUSHION_2")
                                .hookType("技术卖点型")
                                .patternType("TECHNICAL_PROOF")
                                .recommendedOpening("早八底妆也能稳稳在线")
                                .recommendedSellingPoints("[\"24小时持妆\",\"14小时控油\"]")
                                .recommendedScenes("[\"早八\",\"通勤\"]")
                                .recommendedCta("[\"直播间福利\"]")
                                .negativeRules("[\"绝对不脱妆\"]")
                                .patternScore(new BigDecimal("0.92"))
                                .build(),
                        ContentPatternKnowledge.builder()
                                .knowledgeId("cpk-scene")
                                .skuId("SEED_CUSHION_2")
                                .hookType("场景植入型")
                                .patternType("SCENE_SEEDING")
                                .recommendedOpening("通勤出门前底妆最怕斑驳")
                                .recommendedSellingPoints("[\"轻薄服帖\"]")
                                .recommendedScenes("[\"通勤\",\"旅游\"]")
                                .recommendedCta("[\"先领券再下单\"]")
                                .negativeRules("[\"医疗级修复\"]")
                                .patternScore(new BigDecimal("0.78"))
                                .build()));
                return page;
            }
        };

        PatternReferenceVideoRelGateway relGateway = new PatternReferenceVideoRelGateway() {
            @Override
            public Long create(PatternReferenceVideoRel rel) {
                throw new UnsupportedOperationException();
            }

            @Override
            public void softDeleteByKnowledgeId(String knowledgeId) {
                throw new UnsupportedOperationException();
            }

            @Override
            public List<PatternReferenceVideoRel> listByKnowledgeId(String knowledgeId) {
                return List.of(PatternReferenceVideoRel.builder().knowledgeId(knowledgeId).videoId("video-top-1").build());
            }
        };

        ScriptBlueprintGenerateAppService service = new ScriptBlueprintGenerateAppService(
                blueprintDomainService,
                sectionGateway,
                knowledgeGateway,
                relGateway,
                productTruthGateway,
                objectMapper,
                new SkuIdResolver());

        ScriptBlueprint blueprint = service.generate("种籽气垫2.0", "SEEDING", "日常投放", "干皮/混干皮", "DOUYIN", "account-1");

        assertEquals("SEED_CUSHION_2", blueprint.getSkuId());
        assertEquals("FOUNDATION", blueprint.getCategoryCode());
        assertEquals("SEEDING", blueprint.getMarketingGoal());
        assertEquals("FOUNDATION_SEEDING_TECHNICAL_PROOF", blueprint.getRecommendedTemplateCode());
        assertEquals("READY_FOR_AGENT_C", blueprint.getAutoFlowStatus());

        List<Map<String, Object>> candidates = objectMapper.readValue(blueprint.getTemplateCandidatesJson(), new TypeReference<>() {});
        assertEquals(2, candidates.size());
        assertEquals("FOUNDATION_SEEDING_TECHNICAL_PROOF", candidates.get(0).get("templateCode"));

        List<ScriptBlueprintSection> sections = sectionGateway.listByBlueprintCode(blueprint.getBlueprintCode());
        assertEquals(4, sections.size());
        assertEquals("HOOK", sections.get(0).getStageCode());
        assertTrue(sections.get(0).getQueryText().contains("种籽气垫2.0"));
        assertTrue(sections.get(2).getMustCoverJson().contains("24小时持妆"));
    }

    private static class InMemoryScriptBlueprintDomainService implements ScriptBlueprintDomainService {
        private final AtomicLong seq = new AtomicLong(1);
        private final Map<Long, ScriptBlueprint> store = new HashMap<>();

        @Override
        public Long create(ScriptBlueprint blueprint) {
            long id = seq.getAndIncrement();
            blueprint.setId(id);
            store.put(id, blueprint);
            return id;
        }

        @Override
        public void update(ScriptBlueprint blueprint) {
            store.put(blueprint.getId(), blueprint);
        }

        @Override
        public ScriptBlueprint queryById(Long id) {
            return store.get(id);
        }

        @Override
        public ScriptBlueprint queryByBlueprintCode(String blueprintCode) {
            return store.values().stream().filter(item -> blueprintCode.equals(item.getBlueprintCode())).findFirst().orElse(null);
        }
    }

    private static class InMemoryScriptBlueprintSectionGateway implements ScriptBlueprintSectionGateway {
        private final List<ScriptBlueprintSection> store = new ArrayList<>();

        @Override
        public void batchCreate(List<ScriptBlueprintSection> sections) {
            store.addAll(sections);
        }

        @Override
        public List<ScriptBlueprintSection> listByBlueprintCode(String blueprintCode) {
            return store.stream().filter(item -> blueprintCode.equals(item.getBlueprintCode())).sorted(java.util.Comparator.comparing(ScriptBlueprintSection::getSectionNo)).toList();
        }
    }
}
