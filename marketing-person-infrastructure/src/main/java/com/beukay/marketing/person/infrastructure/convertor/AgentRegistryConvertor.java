package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.AgentRegistryDO;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface AgentRegistryConvertor extends BaseConvertor<AgentRegistry, AgentRegistryDO> {

    AgentRegistryConvertor INSTANCE = Mappers.getMapper(AgentRegistryConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "agentUniqueId", source = "agentUniqueId")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "endpointUrl", source = "endpointUrl")
    @Mapping(target = "agentType", source = "agentType")
    @Mapping(target = "version", source = "version")
    @Mapping(target = "ownerId", source = "ownerId")
    @Mapping(target = "definitionId", source = "definitionId")
    @Mapping(target = "definitionVersion", source = "definitionVersion")
    @Mapping(target = "identityId", source = "identityId")
    @Mapping(target = "currentSkillId", source = "currentSkillId")
    @Mapping(target = "endpointType", source = "endpointType")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    AgentRegistryDO to(AgentRegistry agentRegistry);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "agentUniqueId", source = "agentUniqueId")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "endpointUrl", source = "endpointUrl")
    @Mapping(target = "agentType", source = "agentType")
    @Mapping(target = "version", source = "version")
    @Mapping(target = "ownerId", source = "ownerId")
    @Mapping(target = "definitionId", source = "definitionId")
    @Mapping(target = "definitionVersion", source = "definitionVersion")
    @Mapping(target = "identityId", source = "identityId")
    @Mapping(target = "currentSkillId", source = "currentSkillId")
    @Mapping(target = "endpointType", source = "endpointType")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "operator", ignore = true)
    AgentRegistry from(AgentRegistryDO doAgentRegistry);

}
