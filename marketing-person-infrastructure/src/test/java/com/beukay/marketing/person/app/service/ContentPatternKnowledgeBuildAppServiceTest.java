package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.contentPatternKnowledge.ability.ContentPatternKnowledgeDomainService;
import com.beukay.marketing.person.domain.contentPatternKnowledge.gateway.ContentPatternKnowledgeGateway;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledge;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledgeListCriteriaQuery;
import com.beukay.marketing.person.domain.patternReferenceVideoRel.gateway.PatternReferenceVideoRelGateway;
import com.beukay.marketing.person.domain.patternReferenceVideoRel.model.PatternReferenceVideoRel;
import com.beukay.marketing.person.domain.productTruth.gateway.ProductTruthGateway;
import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.domain.videoDeconstructionResult.gateway.VideoDeconstructionResultGateway;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResultListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.service.SkuIdResolver;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ContentPatternKnowledgeBuildAppServiceTest {

    @Test
    void shouldAggregateVideoKnowledgeIntoPatternKnowledge() {
        InMemoryContentPatternKnowledgeGateway knowledgeGateway = new InMemoryContentPatternKnowledgeGateway();
        InMemoryPatternReferenceVideoRelGateway relGateway = new InMemoryPatternReferenceVideoRelGateway();
        ContentPatternKnowledgeDomainService domainService = new InMemoryContentPatternKnowledgeDomainService(knowledgeGateway);
        ProductTruthGateway productTruthGateway = skuId -> {
            if (!"SEED_CUSHION_2".equals(skuId)) {
                return null;
            }
            return ProductTruth.builder()
                    .skuId(skuId)
                    .targetSkinType("[\"干皮\",\"混干皮\"]")
                    .forbiddenClaims("[\"绝对不脱妆\"]")
                    .build();
        };
        VideoDeconstructionResultGateway deconstructionGateway = new InMemoryVideoDeconstructionResultGateway(List.of(
                deconstruction(1L, 101L, "dy-101", "种籽气垫2.0", "场景植入型", "SCENE_SEEDING",
                        "[\"旅游\",\"早八\"]", "[\"24小时持妆\",\"14小时控油\"]", "[\"直播间买1发13\"]",
                        "[\"干皮\",\"混干皮\"]", "谁懂这个气垫的含金量！长白山旅游也能持妆", new BigDecimal("90.50")),
                deconstruction(2L, 102L, "dy-102", "种籽气垫2.0", "场景植入型", "SCENE_SEEDING",
                        "[\"旅游\"]", "[\"24小时持妆\"]", "[\"直播间买1发13\"]",
                        "[\"干皮\"]", "旅游底妆不脱妆，直播间冲", new BigDecimal("85.00")),
                deconstruction(3L, 103L, "dy-103", "种籽气垫2.0", "技术卖点型", "TECHNICAL_PROOF",
                        "[\"通勤\"]", "[\"14小时控油\"]", "[\"直播间福利\"]",
                        "[\"混干皮\"]", "24小时持妆+14小时控油", new BigDecimal("78.00"))
        ));

        ContentPatternKnowledgeBuildAppService service = new ContentPatternKnowledgeBuildAppService(
                domainService,
                deconstructionGateway,
                productTruthGateway,
                relGateway,
                new ObjectMapper(),
                new SkuIdResolver());

        List<ContentPatternKnowledge> results = service.aggregateBySku("seed-cushion-2", "日常投放", null);

        assertEquals(2, results.size());
        ContentPatternKnowledge scenePattern = results.stream()
                .filter(item -> "场景植入型".equals(item.getHookType()))
                .findFirst()
                .orElseThrow();
        assertTrue(scenePattern.getRecommendedScenes().contains("旅游"));
        assertTrue(scenePattern.getRecommendedSellingPoints().contains("24小时持妆"));
        assertTrue(scenePattern.getNegativeRules().contains("绝对不脱妆"));
        assertEquals("日常投放", scenePattern.getMarketingNode());
        assertFalse(relGateway.listByKnowledgeId(scenePattern.getKnowledgeId()).isEmpty());
        assertEquals(3, relGateway.store.size());
    }

    private static VideoDeconstructionResult deconstruction(Long id, Long recordId, String videoId, String skuTag,
                                                            String hookType, String titlePattern, String sceneTags,
                                                            String sellingPointTags, String ctaTags,
                                                            String targetAudienceTags, String title,
                                                            BigDecimal score) {
        return VideoDeconstructionResult.builder()
                .id(id)
                .recordId(recordId)
                .videoId(videoId)
                .skuId("SEED_CUSHION_2")
                .skuTag(skuTag)
                .hookType(hookType)
                .titlePattern(titlePattern)
                .sceneTags(sceneTags)
                .sellingPointTags(sellingPointTags)
                .ctaTags(ctaTags)
                .targetAudienceTags(targetAudienceTags)
                .deconstructionJson("{\"title\":\"" + title + "\"}")
                .actualPerformanceScore(score)
                .verificationStatus("PENDING")
                .status("ENABLED")
                .build();
    }

    private static class InMemoryContentPatternKnowledgeDomainService implements ContentPatternKnowledgeDomainService {

        private final ContentPatternKnowledgeGateway gateway;

        private InMemoryContentPatternKnowledgeDomainService(ContentPatternKnowledgeGateway gateway) {
            this.gateway = gateway;
        }

        @Override
        public Long create(ContentPatternKnowledge knowledge) {
            return gateway.create(knowledge);
        }

        @Override
        public void update(ContentPatternKnowledge knowledge) {
            gateway.update(knowledge);
        }

        @Override
        public ContentPatternKnowledge queryById(Long id) {
            return gateway.queryById(id);
        }

        @Override
        public ContentPatternKnowledge queryByKnowledgeId(String knowledgeId) {
            return gateway.queryByKnowledgeId(knowledgeId);
        }
    }

    private static class InMemoryContentPatternKnowledgeGateway implements ContentPatternKnowledgeGateway {

        private final Map<Long, ContentPatternKnowledge> store = new HashMap<>();
        private final AtomicLong seq = new AtomicLong(1);

        @Override
        public Long create(ContentPatternKnowledge knowledge) {
            long id = seq.getAndIncrement();
            knowledge.setId(id);
            store.put(id, knowledge);
            return id;
        }

        @Override
        public void update(ContentPatternKnowledge knowledge) {
            store.put(knowledge.getId(), knowledge);
        }

        @Override
        public ContentPatternKnowledge queryById(Long id) {
            return store.get(id);
        }

        @Override
        public ContentPatternKnowledge queryByKnowledgeId(String knowledgeId) {
            return store.values().stream()
                    .filter(item -> knowledgeId.equals(item.getKnowledgeId()))
                    .findFirst()
                    .orElse(null);
        }

        @Override
        public PageInfo<ContentPatternKnowledge> listPage(ContentPatternKnowledgeListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
            return new PageInfo<>();
        }
    }

    private static class InMemoryPatternReferenceVideoRelGateway implements PatternReferenceVideoRelGateway {

        private final List<PatternReferenceVideoRel> store = new ArrayList<>();

        @Override
        public Long create(PatternReferenceVideoRel rel) {
            store.add(rel);
            return (long) store.size();
        }

        @Override
        public void softDeleteByKnowledgeId(String knowledgeId) {
            store.removeIf(item -> knowledgeId.equals(item.getKnowledgeId()));
        }

        @Override
        public List<PatternReferenceVideoRel> listByKnowledgeId(String knowledgeId) {
            return store.stream()
                    .filter(item -> knowledgeId.equals(item.getKnowledgeId()))
                    .toList();
        }
    }

    private static class InMemoryVideoDeconstructionResultGateway implements VideoDeconstructionResultGateway {

        private final List<VideoDeconstructionResult> store;

        private InMemoryVideoDeconstructionResultGateway(List<VideoDeconstructionResult> store) {
            this.store = store;
        }

        @Override
        public Long create(VideoDeconstructionResult result) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void update(VideoDeconstructionResult result) {
            throw new UnsupportedOperationException();
        }

        @Override
        public VideoDeconstructionResult queryById(Long id) {
            return store.stream().filter(item -> id.equals(item.getId())).findFirst().orElse(null);
        }

        @Override
        public VideoDeconstructionResult queryByRecordId(Long recordId) {
            return store.stream().filter(item -> recordId.equals(item.getRecordId())).findFirst().orElse(null);
        }

        @Override
        public List<VideoDeconstructionResult> listBySkuId(String skuId) {
            return store.stream()
                    .filter(item -> skuId.equals(item.getSkuId()))
                    .sorted(Comparator.comparing(VideoDeconstructionResult::getActualPerformanceScore).reversed())
                    .toList();
        }

        @Override
        public PageInfo<VideoDeconstructionResult> listPage(VideoDeconstructionResultListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
            return new PageInfo<>();
        }

        @Override
        public VideoDeconstructionResult queryByVideoId(String videoId) { return null; }
    }
}
