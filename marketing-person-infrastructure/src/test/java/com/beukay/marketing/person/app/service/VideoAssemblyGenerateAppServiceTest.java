package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.domain.scriptBlueprint.gateway.ScriptBlueprintGateway;
import com.beukay.marketing.person.domain.scriptBlueprint.gateway.ScriptBlueprintSectionGateway;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprint;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintCriteria;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintSection;
import com.beukay.marketing.person.domain.videoAssembly.ability.VideoAssemblyTaskDomainService;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyCandidateGateway;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyPlanGateway;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyCandidate;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyPlan;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyTask;
import com.beukay.marketing.person.domain.videoSegment.gateway.VideoSegmentGateway;
import com.beukay.marketing.person.domain.videoSegment.model.VideoSegment;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class VideoAssemblyGenerateAppServiceTest {

    @Test
    void shouldGenerateAssemblyTaskCandidatesAndPlan() {
        InMemoryAssemblyTaskDomainService taskDomainService = new InMemoryAssemblyTaskDomainService();
        InMemoryAssemblyCandidateGateway candidateGateway = new InMemoryAssemblyCandidateGateway();
        InMemoryAssemblyPlanGateway planGateway = new InMemoryAssemblyPlanGateway();

        ScriptBlueprint blueprint = ScriptBlueprint.builder()
                .id(1L)
                .blueprintCode("sbp-1")
                .skuId("SEED_CUSHION_2")
                .platform("DOUYIN")
                .status("DRAFT")
                .recommendedTemplateCode("FOUNDATION_SEEDING_TECHNICAL_PROOF")
                .build();
        List<ScriptBlueprintSection> sections = List.of(
                ScriptBlueprintSection.builder().blueprintCode("sbp-1").sectionNo(1).stageCode("HOOK").queryText("种籽气垫2.0 开场 持妆").mustCoverJson("[\"持妆\"]").durationMin(3).durationMax(8).build(),
                ScriptBlueprintSection.builder().blueprintCode("sbp-1").sectionNo(2).stageCode("BENEFIT").queryText("24小时持妆 14小时控油 卖点").mustCoverJson("[\"24小时持妆\",\"14小时控油\"]").durationMin(8).durationMax(16).build());
        List<VideoSegment> segments = List.of(
                VideoSegment.builder().id(101L).videoId("v1").skuId("SEED_CUSHION_2").segmentIndex(1).structureTag("开场").scene("早八").keyPhrase("持妆开场").script("种籽气垫2.0 上脸就是持妆") .sellingPoint("24小时持妆").signalStrength(5).build(),
                VideoSegment.builder().id(102L).videoId("v2").skuId("SEED_CUSHION_2").segmentIndex(2).structureTag("卖点").scene("通勤").keyPhrase("控油持妆").script("14小时控油还很轻薄") .sellingPoint("14小时控油").signalStrength(4).build(),
                VideoSegment.builder().id(103L).videoId("v3").skuId("SEED_CUSHION_2").segmentIndex(3).structureTag("证明").scene("旅游").keyPhrase("服帖不斑驳").script("通勤到晚上都不斑驳") .sellingPoint("服帖轻薄").signalStrength(3).build());

        VideoAssemblyGenerateAppService service = new VideoAssemblyGenerateAppService(
                taskDomainService,
                candidateGateway,
                planGateway,
                new StubBlueprintGateway(blueprint),
                new StubSectionGateway(sections),
                new StubVideoSegmentGateway(segments));

        VideoAssemblyTask task = service.generate("sbp-1");

        assertEquals("sbp-1", task.getBlueprintCode());
        assertEquals("READY", task.getStatus());
        assertEquals(4, candidateGateway.store.size());
        assertEquals(2, planGateway.store.size());
        assertTrue(planGateway.store.getFirst().getSelectionReasonJson().contains("similarityScore"));
    }

    @Test
    void shouldPreferSegmentsMatchingPreferredSignalsAndAvoidNegativeSignals() {
        InMemoryAssemblyTaskDomainService taskDomainService = new InMemoryAssemblyTaskDomainService();
        InMemoryAssemblyCandidateGateway candidateGateway = new InMemoryAssemblyCandidateGateway();
        InMemoryAssemblyPlanGateway planGateway = new InMemoryAssemblyPlanGateway();

        ScriptBlueprint blueprint = ScriptBlueprint.builder()
                .id(2L)
                .blueprintCode("sbp-2")
                .skuId("SEED_CUSHION_2")
                .platform("DOUYIN")
                .status("DRAFT")
                .recommendedTemplateCode("FOUNDATION_SCENE_PROOF")
                .build();
        List<ScriptBlueprintSection> sections = List.of(
                ScriptBlueprintSection.builder()
                        .blueprintCode("sbp-2")
                        .sectionNo(1)
                        .stageCode("SCENE")
                        .queryText("通勤 持妆")
                        .mustCoverJson("[\"持妆\"]")
                        .preferredSignalsJson("[\"通勤\",\"快速节奏\"]")
                        .avoidSignalsJson("[\"旅游\"]")
                        .durationMin(6)
                        .durationMax(12)
                        .build());
        List<VideoSegment> segments = List.of(
                VideoSegment.builder().id(201L).videoId("v201").skuId("SEED_CUSHION_2").segmentIndex(1)
                        .structureTag("场景").scene("通勤").rhythm("快速节奏").keyPhrase("持妆通勤")
                        .script("通勤一天依然持妆").sellingPoint("持妆").signalStrength(2).build(),
                VideoSegment.builder().id(202L).videoId("v202").skuId("SEED_CUSHION_2").segmentIndex(2)
                        .structureTag("场景").scene("旅游").rhythm("快速节奏").keyPhrase("持妆旅游")
                        .script("旅游暴走也持妆").sellingPoint("持妆").signalStrength(5).build());

        VideoAssemblyGenerateAppService service = new VideoAssemblyGenerateAppService(
                taskDomainService,
                candidateGateway,
                planGateway,
                new StubBlueprintGateway(blueprint),
                new StubSectionGateway(sections),
                new StubVideoSegmentGateway(segments));

        service.generate("sbp-2");

        assertEquals(2, candidateGateway.store.size());
        assertEquals(201L, planGateway.store.getFirst().getSegmentId());
        assertTrue(planGateway.store.getFirst().getSelectionReasonJson().contains("preferredSignalHits"));
        assertTrue(planGateway.store.getFirst().getSelectionReasonJson().contains("avoidSignalHits"));
    }

    private static class InMemoryAssemblyTaskDomainService implements VideoAssemblyTaskDomainService {
        private final AtomicLong seq = new AtomicLong(1);
        private final Map<Long, VideoAssemblyTask> store = new HashMap<>();
        @Override public Long create(VideoAssemblyTask task) { long id = seq.getAndIncrement(); task.setId(id); store.put(id, task); return id; }
        @Override public void update(VideoAssemblyTask task) { store.put(task.getId(), task); }
        @Override public VideoAssemblyTask queryById(Long id) { return store.get(id); }
        @Override public VideoAssemblyTask queryByTaskCode(String taskCode) { return store.values().stream().filter(i -> taskCode.equals(i.getTaskCode())).findFirst().orElse(null); }
    }

    private static class InMemoryAssemblyCandidateGateway implements VideoAssemblyCandidateGateway {
        private final List<VideoAssemblyCandidate> store = new ArrayList<>();
        @Override public void batchCreate(List<VideoAssemblyCandidate> candidates) { store.addAll(candidates); }
        @Override public List<VideoAssemblyCandidate> listByTaskCode(String taskCode) { return store.stream().filter(i -> taskCode.equals(i.getTaskCode())).toList(); }
    }

    private static class InMemoryAssemblyPlanGateway implements VideoAssemblyPlanGateway {
        private final List<VideoAssemblyPlan> store = new ArrayList<>();
        @Override public void batchCreate(List<VideoAssemblyPlan> plans) { store.addAll(plans); }
        @Override public List<VideoAssemblyPlan> listByTaskCode(String taskCode) { return store.stream().filter(i -> taskCode.equals(i.getTaskCode())).toList(); }
    }

    private record StubBlueprintGateway(ScriptBlueprint blueprint) implements ScriptBlueprintGateway {
        @Override public Long create(ScriptBlueprint blueprint) { throw new UnsupportedOperationException(); }
        @Override public void update(ScriptBlueprint blueprint) { throw new UnsupportedOperationException(); }
        @Override public ScriptBlueprint queryById(Long id) { return blueprint; }
        @Override public ScriptBlueprint queryByBlueprintCode(String blueprintCode) { return blueprint; }
        @Override public PageInfo<ScriptBlueprint> listByPage(ScriptBlueprintCriteria criteria) { return new PageInfo<>(); }
    }

    private record StubSectionGateway(List<ScriptBlueprintSection> sections) implements ScriptBlueprintSectionGateway {
        @Override public void batchCreate(List<ScriptBlueprintSection> sections) { throw new UnsupportedOperationException(); }
        @Override public List<ScriptBlueprintSection> listByBlueprintCode(String blueprintCode) { return sections; }
    }

    private record StubVideoSegmentGateway(List<VideoSegment> segments) implements VideoSegmentGateway {
        @Override public void batchCreate(List<VideoSegment> segments) { throw new UnsupportedOperationException(); }
        @Override public List<VideoSegment> listByTaskId(String taskId) { return List.of(); }
        @Override public List<VideoSegment> listByVideoId(String videoId) { return segments.stream().filter(i -> videoId.equals(i.getVideoId())).toList(); }
        @Override public List<VideoSegment> listBySkuId(String skuId) { return segments.stream().filter(i -> skuId.equals(i.getSkuId())).toList(); }
    }
}
