package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.AgentDefinitionDO;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

/**
 * Domain <-> DO 转换器
 */
@Mapper(uses = BooleanStrategy.class)
public interface AgentDefinitionConvertor extends BaseConvertor<AgentDefinition, AgentDefinitionDO> {

    AgentDefinitionConvertor INSTANCE = Mappers.getMapper(AgentDefinitionConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "agentDefId", source = "agentDefId")
    @Mapping(target = "behaviorDsl", source = "behaviorDsl")
    @Mapping(target = "modelConfig", source = "modelConfig")
    @Mapping(target = "businessRules", source = "businessRules")
    @Mapping(target = "skillIds", source = "skillIds")
    @Mapping(target = "version", source = "version")
    @Mapping(target = "publishStatus", source = "publishStatus")
    @Mapping(target = "lastPublishAt", source = "lastPublishAt")
    @Mapping(target = "lastPublishBy", source = "lastPublishBy")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    AgentDefinitionDO to(AgentDefinition agentDefinition);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "agentDefId", source = "agentDefId")
    @Mapping(target = "behaviorDsl", source = "behaviorDsl")
    @Mapping(target = "modelConfig", source = "modelConfig")
    @Mapping(target = "businessRules", source = "businessRules")
    @Mapping(target = "skillIds", source = "skillIds")
    @Mapping(target = "version", source = "version")
    @Mapping(target = "publishStatus", source = "publishStatus")
    @Mapping(target = "lastPublishAt", source = "lastPublishAt")
    @Mapping(target = "lastPublishBy", source = "lastPublishBy")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "operator", ignore = true)
    AgentDefinition from(AgentDefinitionDO doAgentDefinition);

}
