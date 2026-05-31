package com.beukay.marketing.person.app.service;

import com.beukay.marketing.person.domain.productTruth.gateway.ProductTruthGateway;
import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.domain.videoDeconstructionResult.ability.VideoDeconstructionResultDomainService;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.beukay.marketing.person.infrastructure.service.VideoUnderstandingAnalyzer;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class VideoAnalysisKnowledgeServiceTest {

    @Test
    void shouldUseUniqueSyntheticRecordIdForUploadedVideoAnalysisResults() {
        InMemoryVideoDeconstructionResultDomainService domainService = new InMemoryVideoDeconstructionResultDomainService();
        ProductTruthGateway productTruthGateway = skuId -> ProductTruth.builder()
                .skuId(skuId)
                .productName("玛丽黛佳种籽气垫2.0")
                .build();
        VideoAnalysisKnowledgeService service = new VideoAnalysisKnowledgeService(domainService, null, productTruthGateway);

        service.persistFromAnalysis("video-task-alpha", "SEED_CUSHION_2", analysis());
        service.persistFromAnalysis("video-task-beta", "SEED_CUSHION_2", analysis());

        assertTrue(domainService.store.get(0).getRecordId() < 0, "上传视频拆解结果应使用负数 synthetic recordId，避免与真实投放记录冲突");
        assertNotEquals(domainService.store.get(0).getRecordId(), domainService.store.get(1).getRecordId(), "不同 taskId 不能复用同一个 recordId");
    }

    private static VideoUnderstandingAnalyzer.VideoUnderstandingAnalysis analysis() {
        return VideoUnderstandingAnalyzer.VideoUnderstandingAnalysis.builder()
                .summary("视频摘要")
                .transcript("口播")
                .hookType("场景植入型")
                .titlePattern("SCENE_SEEDING")
                .sceneTags(List.of("室内"))
                .sellingPointTags(List.of("持妆"))
                .ctaTags(List.of("立即购买"))
                .emotionTags(List.of("安心"))
                .targetAudienceTags(List.of("敏感肌"))
                .reasoning("测试")
                .segments(List.of())
                .build();
    }

    private static class InMemoryVideoDeconstructionResultDomainService implements VideoDeconstructionResultDomainService {
        private final List<VideoDeconstructionResult> store = new ArrayList<>();

        @Override
        public Long create(VideoDeconstructionResult result) {
            result.setId((long) store.size() + 1);
            store.add(result);
            return result.getId();
        }

        @Override public void update(VideoDeconstructionResult result) {}
        @Override public VideoDeconstructionResult queryById(Long id) { return null; }
        @Override public VideoDeconstructionResult queryByRecordId(Long recordId) { return null; }
        @Override public VideoDeconstructionResult queryByVideoId(String videoId) {
            return store.stream().filter(item -> videoId.equals(item.getVideoId())).findFirst().orElse(null);
        }
    }
}
