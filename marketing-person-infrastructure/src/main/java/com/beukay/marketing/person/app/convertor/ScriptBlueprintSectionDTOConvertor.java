package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.ScriptBlueprintSectionDTO;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintSection;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ScriptBlueprintSectionDTOConvertor {
    ScriptBlueprintSectionDTOConvertor INSTANCE = Mappers.getMapper(ScriptBlueprintSectionDTOConvertor.class);

    default ScriptBlueprintSectionDTO convert(ScriptBlueprintSection source) {
        return ScriptBlueprintSectionDTO.builder()
                .sectionNo(source.getSectionNo())
                .stageCode(source.getStageCode())
                .stageName(source.getStageName())
                .goal(source.getGoal())
                .semanticIntent(source.getSemanticIntent())
                .queryText(source.getQueryText())
                .mustCoverJson(source.getMustCoverJson())
                .preferredSignalsJson(source.getPreferredSignalsJson())
                .avoidSignalsJson(source.getAvoidSignalsJson())
                .durationMin(source.getDurationMin())
                .durationMax(source.getDurationMax())
                .narrationHint(source.getNarrationHint())
                .build();
    }
}
