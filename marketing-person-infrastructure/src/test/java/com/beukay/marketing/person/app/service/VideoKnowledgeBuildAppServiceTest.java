package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.productTruth.gateway.ProductTruthGateway;
import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.domain.videoPatternCandidate.ability.VideoPatternCandidateDomainService;
import com.beukay.marketing.person.domain.videoPatternCandidate.gateway.VideoPatternCandidateGateway;
import com.beukay.marketing.person.domain.videoPatternCandidate.model.VideoPatternCandidate;
import com.beukay.marketing.person.domain.videoDeconstructionResult.ability.VideoDeconstructionResultDomainService;
import com.beukay.marketing.person.domain.videoDeconstructionResult.gateway.VideoDeconstructionResultGateway;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResultListCriteriaQuery;
import com.beukay.marketing.person.domain.videoPerformanceRecord.gateway.VideoPerformanceRecordGateway;
import com.beukay.marketing.person.domain.videoPerformanceRecord.model.VideoPerformanceRecord;
import com.beukay.marketing.person.infrastructure.service.RuleBasedVideoDeconstructionEngine;
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
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;

class VideoKnowledgeBuildAppServiceTest {

    @Test
    void shouldBuildKnowledgeForSingleVideoAndReuseExistingResult() {
        InMemoryVideoDeconstructionResultGateway deconstructionGateway = new InMemoryVideoDeconstructionResultGateway();
        InMemoryVideoPatternCandidateGateway candidateGateway = new InMemoryVideoPatternCandidateGateway();
        VideoDeconstructionResultDomainService domainService = new InMemoryVideoDeconstructionResultDomainService(deconstructionGateway);
        VideoPatternCandidateDomainService candidateDomainService = new InMemoryVideoPatternCandidateDomainService(candidateGateway);
        ProductTruthGateway productTruthGateway = skuId -> {
            if (!"SEED_CUSHION_2".equals(skuId)) {
                return null;
            }
            return ProductTruth.builder()
                    .skuId(skuId)
                    .preferredScenes("[\"旅游\",\"早八\"]")
                    .evidencePoints("[\"24小时持妆\",\"14小时控油\"]")
                    .targetSkinType("[\"干皮\",\"混干皮\"]")
                    .promotionMechanisms("[\"直播间买1发13\"]")
                    .forbiddenClaims("[\"绝对不脱妆\"]")
                    .build();
        };
        VideoPerformanceRecordGateway recordGateway = recordId -> VideoPerformanceRecord.builder()
                .id(recordId)
                .videoId("dy-" + recordId)
                .title("谁懂这个种籽气垫的含金量！长白山旅游也能24小时持妆，直播间买1发13")
                .skuTag("种籽气垫2.0")
                .hookType("场景植入型")
                .compositeScore(new BigDecimal("88.80"))
                .build();

        VideoKnowledgeBuildAppService service = new VideoKnowledgeBuildAppService(
                domainService,
                productTruthGateway,
                recordGateway,
                new RuleBasedVideoDeconstructionEngine(new ObjectMapper()),
                new SkuIdResolver(),
                candidateDomainService);

        VideoDeconstructionResult first = service.deconstruct(2001L, "seed-cushion-2");
        VideoDeconstructionResult second = service.deconstruct(2001L, "seed-cushion-2");

        assertNotNull(first.getId());
        assertEquals(1, deconstructionGateway.store.size());
        assertEquals("SEED_CUSHION_2", first.getSkuId());
        assertEquals("场景植入型", first.getHookType());
        assertEquals("SCENE_SEEDING", first.getRecommendedPatternCode());
        assertEquals(3, candidateGateway.store.size());
        assertEquals("SCENE_SEEDING", candidateGateway.store.getFirst().getPatternCode());
        assertSame(first, second);
    }

    private static class InMemoryVideoPatternCandidateDomainService implements VideoPatternCandidateDomainService {

        private final VideoPatternCandidateGateway gateway;

        private InMemoryVideoPatternCandidateDomainService(VideoPatternCandidateGateway gateway) {
            this.gateway = gateway;
        }

        @Override
        public void batchCreate(List<VideoPatternCandidate> candidates) {
            gateway.batchCreate(candidates);
        }

        @Override
        public List<VideoPatternCandidate> listByDeconstructionResultId(Long deconstructionResultId) {
            return gateway.listByDeconstructionResultId(deconstructionResultId);
        }
    }

    private static class InMemoryVideoDeconstructionResultDomainService implements VideoDeconstructionResultDomainService {

        private final VideoDeconstructionResultGateway gateway;

        private InMemoryVideoDeconstructionResultDomainService(VideoDeconstructionResultGateway gateway) {
            this.gateway = gateway;
        }

        @Override
        public Long create(VideoDeconstructionResult result) {
            return gateway.create(result);
        }

        @Override
        public void update(VideoDeconstructionResult result) {
            gateway.update(result);
        }

        @Override
        public VideoDeconstructionResult queryById(Long id) {
            return gateway.queryById(id);
        }

        @Override
        public VideoDeconstructionResult queryByRecordId(Long recordId) {
            return gateway.queryByRecordId(recordId);
        }

        @Override
        public VideoDeconstructionResult queryByVideoId(String videoId) { return gateway.queryByVideoId(videoId); }
    }

    private static class InMemoryVideoDeconstructionResultGateway implements VideoDeconstructionResultGateway {

        private final Map<Long, VideoDeconstructionResult> store = new HashMap<>();
        private final AtomicLong seq = new AtomicLong(1);

        @Override
        public Long create(VideoDeconstructionResult result) {
            long id = seq.getAndIncrement();
            result.setId(id);
            store.put(id, result);
            return id;
        }

        @Override
        public void update(VideoDeconstructionResult result) {
            store.put(result.getId(), result);
        }

        @Override
        public VideoDeconstructionResult queryById(Long id) {
            return store.get(id);
        }

        @Override
        public VideoDeconstructionResult queryByRecordId(Long recordId) {
            return store.values().stream()
                    .filter(item -> recordId.equals(item.getRecordId()))
                    .findFirst()
                    .orElse(null);
        }

        @Override
        public List<VideoDeconstructionResult> listBySkuId(String skuId) {
            return store.values().stream()
                    .filter(item -> skuId.equals(item.getSkuId()))
                    .sorted(Comparator.comparing(VideoDeconstructionResult::getId))
                    .toList();
        }

        @Override
        public PageInfo<VideoDeconstructionResult> listPage(VideoDeconstructionResultListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
            return new PageInfo<>();
        }

        @Override
        public VideoDeconstructionResult queryByVideoId(String videoId) {
            return store.values().stream()
                    .filter(item -> videoId.equals(item.getVideoId()))
                    .findFirst()
                    .orElse(null);
        }
    }

    private static class InMemoryVideoPatternCandidateGateway implements VideoPatternCandidateGateway {

        private final List<VideoPatternCandidate> store = new ArrayList<>();

        @Override
        public void batchCreate(List<VideoPatternCandidate> candidates) {
            store.addAll(candidates);
        }

        @Override
        public List<VideoPatternCandidate> listByDeconstructionResultId(Long deconstructionResultId) {
            return store.stream()
                    .filter(item -> deconstructionResultId.equals(item.getDeconstructionResultId()))
                    .sorted(Comparator.comparing(VideoPatternCandidate::getRankNo))
                    .toList();
        }
    }
}
