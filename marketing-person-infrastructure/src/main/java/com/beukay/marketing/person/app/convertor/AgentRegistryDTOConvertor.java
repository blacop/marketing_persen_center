package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.AgentRegistryDTO;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistry;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface AgentRegistryDTOConvertor {

    AgentRegistryDTOConvertor INSTANCE = Mappers.getMapper(AgentRegistryDTOConvertor.class);

    default AgentRegistryDTO convert(AgentRegistry agentRegistry) {
        return AgentRegistryDTO.builder()
                .id(agentRegistry.getId())
                .name(agentRegistry.getName())
                .description(agentRegistry.getDescription())
                .status(agentRegistry.getStatus())
                .agentUniqueId(agentRegistry.getAgentUniqueId())
                .category(agentRegistry.getCategory())
                .endpointUrl(agentRegistry.getEndpointUrl())
                .agentType(agentRegistry.getAgentType())
                .version(agentRegistry.getVersion())
                .ownerId(agentRegistry.getOwnerId())
                .definitionId(agentRegistry.getDefinitionId())
                .definitionVersion(agentRegistry.getDefinitionVersion())
                .identityId(agentRegistry.getIdentityId())
                .currentSkillId(agentRegistry.getCurrentSkillId())
                .endpointType(agentRegistry.getEndpointType())
                .createAt(agentRegistry.getBaseFields() != null ? agentRegistry.getBaseFields().getCreateAt() : null)
                .createName(agentRegistry.getBaseFields() != null ? agentRegistry.getBaseFields().getCreateName() : null)
                .build();
    }

}
