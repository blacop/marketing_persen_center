package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.AgentIdentityDTO;
import com.beukay.marketing.person.domain.agentIdentity.model.AgentIdentity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

/**
 * AgentIdentity Domain -> DTO 转换器
 */
@Mapper
public interface AgentIdentityDTOConvertor {

    AgentIdentityDTOConvertor INSTANCE = Mappers.getMapper(AgentIdentityDTOConvertor.class);

    /**
     * 将领域实体转换为 DTO
     */
    default AgentIdentityDTO convert(AgentIdentity agentIdentity) {
        return AgentIdentityDTO.builder()
                .id(agentIdentity.getId())
                .name(agentIdentity.getName())
                .description(agentIdentity.getDescription())
                .status(agentIdentity.getStatus())
                .agentUniqueId(agentIdentity.getAgentUniqueId())
                .publicKey(agentIdentity.getPublicKey())
                .authPolicy(agentIdentity.getAuthPolicy())
                .ownerId(agentIdentity.getOwnerId())
                .agentType(agentIdentity.getAgentType())
                .createAt(agentIdentity.getBaseFields() != null ? agentIdentity.getBaseFields().getCreateAt() : null)
                .createName(agentIdentity.getBaseFields() != null ? agentIdentity.getBaseFields().getCreateName() : null)
                .build();
    }

}
