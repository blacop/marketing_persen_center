package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.client.dto.ScriptBlueprintDTO;
import com.beukay.marketing.person.domain.scriptBlueprint.gateway.ScriptBlueprintGateway;
import com.beukay.marketing.person.domain.scriptBlueprint.gateway.ScriptBlueprintSectionGateway;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprint;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintCriteria;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintSection;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ScriptBlueprintDetailQryExecutorTest {

    @Test
    void shouldReturnBlueprintWithSectionsAndTemplateCandidates() {
        ScriptBlueprint blueprint = ScriptBlueprint.builder()
                .id(1L)
                .blueprintCode("sbp-1")
                .skuId("SEED_CUSHION_2")
                .recommendedTemplateCode("FOUNDATION_SEEDING_TECHNICAL_PROOF")
                .recommendedTemplateName("FOUNDATION-SEEDING-技术卖点型")
                .recommendedTemplateReason("命中技术卖点型 / TECHNICAL_PROOF")
                .templateCandidatesJson("[{\"templateCode\":\"FOUNDATION_SEEDING_TECHNICAL_PROOF\",\"templateName\":\"FOUNDATION-SEEDING-技术卖点型\",\"matchScore\":0.92,\"reasonJson\":\"命中技术卖点型\",\"rankNo\":1,\"recommended\":true}]")
                .autoFlowStatus("READY_FOR_AGENT_C")
                .build();

        List<ScriptBlueprintSection> sections = List.of(
                ScriptBlueprintSection.builder().blueprintCode("sbp-1").sectionNo(1).stageCode("HOOK").stageName("开场破题").queryText("种籽气垫2.0 开场钩子").build(),
                ScriptBlueprintSection.builder().blueprintCode("sbp-1").sectionNo(2).stageCode("BENEFIT").stageName("方案卖点").queryText("24小时持妆").build());

        ScriptBlueprintDetailQryExecutor executor = new ScriptBlueprintDetailQryExecutor(
                new StubBlueprintGateway(blueprint),
                new StubSectionGateway(sections));

        ScriptBlueprintDTO dto = executor.getById(1L);

        assertEquals("FOUNDATION_SEEDING_TECHNICAL_PROOF", dto.getRecommendedTemplateCode());
        assertNotNull(dto.getTemplateCandidates());
        assertEquals(1, dto.getTemplateCandidates().size());
        assertEquals(2, dto.getSections().size());
        assertEquals("HOOK", dto.getSections().getFirst().getStageCode());
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
}
