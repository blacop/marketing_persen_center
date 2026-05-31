package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.client.dto.VideoDeconstructionDTO;
import com.beukay.marketing.person.domain.videoDeconstructionResult.gateway.VideoDeconstructionResultGateway;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResultListCriteriaQuery;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class VideoDeconstructionDetailQryExecutorTest {

    @Test
    void shouldReturnPatternCandidatesFromDecisionJson() {
        VideoDeconstructionResult result = VideoDeconstructionResult.builder()
                .id(1L)
                .recordId(2001L)
                .videoId("dy-2001")
                .recommendedPatternCode("SCENE_SEEDING")
                .recommendedPatternName("场景植入型")
                .recommendedPatternReason("标题中命中旅游和早八场景")
                .patternDecisionJson("""
                        {"recommendedPatternCode":"SCENE_SEEDING","recommendedPatternName":"场景植入型","recommendedPatternReason":"标题中命中旅游和早八场景","candidates":[{"patternCode":"SCENE_SEEDING","patternName":"场景植入型","matchScore":1.23,"reason":"标题命中旅游、早八","rankNo":1,"recommended":true},{"patternCode":"TECH_SELLING","patternName":"技术卖点型","matchScore":0.66,"reason":"标题命中持妆","rankNo":2,"recommended":false}]}
                        """)
                .build();

        VideoDeconstructionDetailQryExecutor executor = new VideoDeconstructionDetailQryExecutor(new StubGateway(result));

        VideoDeconstructionDTO dto = executor.getById(1L);

        assertEquals("SCENE_SEEDING", dto.getRecommendedPatternCode());
        assertNotNull(dto.getPatternCandidates());
        assertEquals(2, dto.getPatternCandidates().size());
        assertEquals("TECH_SELLING", dto.getPatternCandidates().get(1).getPatternCode());
    }

    private record StubGateway(VideoDeconstructionResult result) implements VideoDeconstructionResultGateway {
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
            return result;
        }

        @Override
        public VideoDeconstructionResult queryByRecordId(Long recordId) {
            throw new UnsupportedOperationException();
        }

        @Override
        public java.util.List<VideoDeconstructionResult> listBySkuId(String skuId) {
            throw new UnsupportedOperationException();
        }

        @Override
        public com.beukay.ai.common.entity.PageInfo<VideoDeconstructionResult> listPage(VideoDeconstructionResultListCriteriaQuery criteriaQuery,
                                                                                           com.beukay.ai.common.entity.PageQuery pageQuery) {
            throw new UnsupportedOperationException();
        }

        @Override
        public VideoDeconstructionResult queryByVideoId(String videoId) { return null; }
    }
}
