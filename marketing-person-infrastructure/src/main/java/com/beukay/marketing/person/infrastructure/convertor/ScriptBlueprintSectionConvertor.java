package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.ScriptBlueprintSectionDO;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintSection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface ScriptBlueprintSectionConvertor extends BaseConvertor<ScriptBlueprintSection, ScriptBlueprintSectionDO> {

    ScriptBlueprintSectionConvertor INSTANCE = Mappers.getMapper(ScriptBlueprintSectionConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "blueprintCode", source = "blueprintCode")
    @Mapping(target = "sectionNo", source = "sectionNo")
    @Mapping(target = "stageCode", source = "stageCode")
    @Mapping(target = "stageName", source = "stageName")
    @Mapping(target = "goal", source = "goal")
    @Mapping(target = "semanticIntent", source = "semanticIntent")
    @Mapping(target = "queryText", source = "queryText")
    @Mapping(target = "mustCoverJson", source = "mustCoverJson")
    @Mapping(target = "preferredSignalsJson", source = "preferredSignalsJson")
    @Mapping(target = "avoidSignalsJson", source = "avoidSignalsJson")
    @Mapping(target = "durationMin", source = "durationMin")
    @Mapping(target = "durationMax", source = "durationMax")
    @Mapping(target = "narrationHint", source = "narrationHint")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    ScriptBlueprintSectionDO to(ScriptBlueprintSection source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "blueprintCode", source = "blueprintCode")
    @Mapping(target = "sectionNo", source = "sectionNo")
    @Mapping(target = "stageCode", source = "stageCode")
    @Mapping(target = "stageName", source = "stageName")
    @Mapping(target = "goal", source = "goal")
    @Mapping(target = "semanticIntent", source = "semanticIntent")
    @Mapping(target = "queryText", source = "queryText")
    @Mapping(target = "mustCoverJson", source = "mustCoverJson")
    @Mapping(target = "preferredSignalsJson", source = "preferredSignalsJson")
    @Mapping(target = "avoidSignalsJson", source = "avoidSignalsJson")
    @Mapping(target = "durationMin", source = "durationMin")
    @Mapping(target = "durationMax", source = "durationMax")
    @Mapping(target = "narrationHint", source = "narrationHint")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "operator", ignore = true)
    ScriptBlueprintSection from(ScriptBlueprintSectionDO source);
}
