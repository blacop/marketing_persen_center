package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.ScriptBlueprintDO;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprint;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface ScriptBlueprintConvertor extends BaseConvertor<ScriptBlueprint, ScriptBlueprintDO> {

    ScriptBlueprintConvertor INSTANCE = Mappers.getMapper(ScriptBlueprintConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "blueprintCode", source = "blueprintCode")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "categoryCode", source = "categoryCode")
    @Mapping(target = "marketingGoal", source = "marketingGoal")
    @Mapping(target = "marketingNode", source = "marketingNode")
    @Mapping(target = "targetAudience", source = "targetAudience")
    @Mapping(target = "platform", source = "platform")
    @Mapping(target = "accountId", source = "accountId")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "blueprintSummary", source = "blueprintSummary")
    @Mapping(target = "recommendedTemplateCode", source = "recommendedTemplateCode")
    @Mapping(target = "recommendedTemplateName", source = "recommendedTemplateName")
    @Mapping(target = "recommendedTemplateReason", source = "recommendedTemplateReason")
    @Mapping(target = "templateCandidatesJson", source = "templateCandidatesJson")
    @Mapping(target = "blueprintJson", source = "blueprintJson")
    @Mapping(target = "logicTrace", source = "logicTrace")
    @Mapping(target = "autoFlowStatus", source = "autoFlowStatus")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    ScriptBlueprintDO to(ScriptBlueprint source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "blueprintCode", source = "blueprintCode")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "categoryCode", source = "categoryCode")
    @Mapping(target = "marketingGoal", source = "marketingGoal")
    @Mapping(target = "marketingNode", source = "marketingNode")
    @Mapping(target = "targetAudience", source = "targetAudience")
    @Mapping(target = "platform", source = "platform")
    @Mapping(target = "accountId", source = "accountId")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "blueprintSummary", source = "blueprintSummary")
    @Mapping(target = "recommendedTemplateCode", source = "recommendedTemplateCode")
    @Mapping(target = "recommendedTemplateName", source = "recommendedTemplateName")
    @Mapping(target = "recommendedTemplateReason", source = "recommendedTemplateReason")
    @Mapping(target = "templateCandidatesJson", source = "templateCandidatesJson")
    @Mapping(target = "blueprintJson", source = "blueprintJson")
    @Mapping(target = "logicTrace", source = "logicTrace")
    @Mapping(target = "autoFlowStatus", source = "autoFlowStatus")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "operator", ignore = true)
    ScriptBlueprint from(ScriptBlueprintDO source);
}
