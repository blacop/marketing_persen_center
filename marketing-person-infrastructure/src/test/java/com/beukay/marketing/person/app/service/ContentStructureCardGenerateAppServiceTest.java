package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
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
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ContentStructureCardGenerateAppServiceTest {

    @Test
    void shouldGenerateCardWhenUsingSkuAlias() {
        InMemoryContentStructureCardDomainService cardDomainService = new InMemoryContentStructureCardDomainService();
        ContentPatternKnowledgeGateway knowledgeGateway = new InMemoryContentPatternKnowledgeGateway();
        PatternReferenceVideoRelGateway relGateway = new InMemoryPatternReferenceVideoRelGateway();
        ProductTruthGateway productTruthGateway = skuId -> {
            if (!"SEED_CUSHION_2".equals(skuId)) {
                return null;
            }
            return ProductTruth.builder()
                    .skuId("SEED_CUSHION_2")
                    .coreBenefits("[\"持妆\",\"控油\"]")
                    .forbiddenClaims("[\"绝对不脱妆\"]")
                    .build();
        };

        ContentStructureCardGenerateAppService service = new ContentStructureCardGenerateAppService(
                cardDomainService,
                knowledgeGateway,
                relGateway,
                productTruthGateway,
                new ObjectMapper(),
                new SkuIdResolver());

        ContentStructureCard card = service.generate("种籽气垫2.0", "日常投放", "干皮/混干皮", "account-1");

        assertEquals("SEED_CUSHION_2", card.getSkuId());
        assertEquals("技术卖点型", card.getHookType());
        assertTrue(card.getLogicTrace().contains("cpk-top-1"));
        assertEquals("video-top-1", card.getReferenceVideoId());
    }

    private static class InMemoryContentStructureCardDomainService implements ContentStructureCardDomainService {

        private final AtomicLong seq = new AtomicLong(1);
        private final Map<Long, ContentStructureCard> store = new HashMap<>();

        @Override
        public Long create(ContentStructureCard card) {
            long id = seq.getAndIncrement();
            card.setId(id);
            store.put(id, card);
            return id;
        }

        @Override
        public void update(ContentStructureCard card) {
            store.put(card.getId(), card);
        }

        @Override
        public ContentStructureCard queryById(Long id) {
            return store.get(id);
        }

        @Override
        public ContentStructureCard queryByCardId(String cardId) {
            return store.values().stream().filter(item -> cardId.equals(item.getCardId())).findFirst().orElse(null);
        }
    }

    private static class InMemoryContentPatternKnowledgeGateway implements ContentPatternKnowledgeGateway {

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
            page.setPageIndex(1L);
            page.setPageSize(10L);
            page.setTotal(1L);
            page.setRecords(List.of(ContentPatternKnowledge.builder()
                    .knowledgeId("cpk-top-1")
                    .skuId("SEED_CUSHION_2")
                    .hookType("技术卖点型")
                    .patternType("TECHNICAL_PROOF")
                    .recommendedOpening("国货彩妆顶流")
                    .recommendedSellingPoints("[\"24小时持妆\"]")
                    .recommendedScenes("[\"早八\"]")
                    .recommendedCta("[\"直播间福利\"]")
                    .negativeRules("[\"绝对不脱妆\"]")
                    .patternScore(new BigDecimal("0.729488"))
                    .build()));
            return page;
        }
    }

    private static class InMemoryPatternReferenceVideoRelGateway implements PatternReferenceVideoRelGateway {

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
            return List.of(PatternReferenceVideoRel.builder()
                    .knowledgeId(knowledgeId)
                    .videoId("video-top-1")
                    .build());
        }
    }
}
