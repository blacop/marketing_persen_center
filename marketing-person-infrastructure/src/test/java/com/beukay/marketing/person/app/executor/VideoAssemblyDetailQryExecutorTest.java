package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.client.dto.VideoAssemblyDTO;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyCandidateGateway;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyPlanGateway;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyTaskGateway;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyCandidate;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyPlan;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyTask;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class VideoAssemblyDetailQryExecutorTest {

    @Test
    void shouldReturnAssemblyTaskWithCandidatesAndPlanSections() {
        VideoAssemblyTask task = VideoAssemblyTask.builder()
                .id(1L)
                .taskCode("vat-1")
                .blueprintCode("sbp-1")
                .status("READY")
                .platform("DOUYIN")
                .targetDuration(16)
                .interventionStatus("AUTO")
                .summaryJson("{\"sectionCount\":2}")
                .build();
        List<VideoAssemblyCandidate> candidates = List.of(
                VideoAssemblyCandidate.builder().taskCode("vat-1").sectionNo(1).segmentId(101L).videoId("v1").similarityScore(new BigDecimal("0.85")).matchReasonJson("{\"similarityScore\":0.85}").rankNo(1).selected(true).build(),
                VideoAssemblyCandidate.builder().taskCode("vat-1").sectionNo(2).segmentId(102L).videoId("v2").similarityScore(new BigDecimal("0.65")).matchReasonJson("{\"similarityScore\":0.65}").rankNo(1).selected(true).build());
        List<VideoAssemblyPlan> plans = List.of(
                VideoAssemblyPlan.builder().taskCode("vat-1").sectionNo(1).segmentId(101L).videoId("v1").selectionReasonJson("{\"similarityScore\":0.85}").build(),
                VideoAssemblyPlan.builder().taskCode("vat-1").sectionNo(2).segmentId(102L).videoId("v2").selectionReasonJson("{\"similarityScore\":0.65}").build());

        VideoAssemblyDetailQryExecutor executor = new VideoAssemblyDetailQryExecutor(
                new StubTaskGateway(task),
                new StubCandidateGateway(candidates),
                new StubPlanGateway(plans));

        VideoAssemblyDTO dto = executor.getById(1L);

        assertEquals("vat-1", dto.getTaskCode());
        assertNotNull(dto.getCandidates());
        assertEquals(2, dto.getCandidates().size());
        assertNotNull(dto.getPlanSections());
        assertEquals(2, dto.getPlanSections().size());
        assertEquals(101L, dto.getPlanSections().getFirst().getSegmentId());
    }

    private record StubTaskGateway(VideoAssemblyTask task) implements VideoAssemblyTaskGateway {
        @Override public Long create(VideoAssemblyTask task) { throw new UnsupportedOperationException(); }
        @Override public void update(VideoAssemblyTask task) { throw new UnsupportedOperationException(); }
        @Override public VideoAssemblyTask queryById(Long id) { return task; }
        @Override public VideoAssemblyTask queryByTaskCode(String taskCode) { return task; }
    }

    private record StubCandidateGateway(List<VideoAssemblyCandidate> candidates) implements VideoAssemblyCandidateGateway {
        @Override public void batchCreate(List<VideoAssemblyCandidate> candidates) { throw new UnsupportedOperationException(); }
        @Override public List<VideoAssemblyCandidate> listByTaskCode(String taskCode) { return candidates; }
    }

    private record StubPlanGateway(List<VideoAssemblyPlan> plans) implements VideoAssemblyPlanGateway {
        @Override public void batchCreate(List<VideoAssemblyPlan> plans) { throw new UnsupportedOperationException(); }
        @Override public List<VideoAssemblyPlan> listByTaskCode(String taskCode) { return plans; }
    }
}
