package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.AgentIdentityDO;
import com.beukay.marketing.person.domain.agentIdentity.model.AgentIdentity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

/**
 * AgentIdentity Domain <-> DO 转换器
 */
@Mapper(uses = BooleanStrategy.class)
public interface AgentIdentityConvertor extends BaseConvertor<AgentIdentity, AgentIdentityDO> {

    AgentIdentityConvertor INSTANCE = Mappers.getMapper(AgentIdentityConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "agentUniqueId", source = "agentUniqueId")
    @Mapping(target = "publicKey", source = "publicKey")
    @Mapping(target = "authPolicy", source = "authPolicy")
    @Mapping(target = "ownerId", source = "ownerId")
    @Mapping(target = "agentType", source = "agentType")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    AgentIdentityDO to(AgentIdentity agentIdentity);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "agentUniqueId", source = "agentUniqueId")
    @Mapping(target = "publicKey", source = "publicKey")
    @Mapping(target = "authPolicy", source = "authPolicy")
    @Mapping(target = "ownerId", source = "ownerId")
    @Mapping(target = "agentType", source = "agentType")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "operator", ignore = true)
    AgentIdentity from(AgentIdentityDO doAgentIdentity);

}
