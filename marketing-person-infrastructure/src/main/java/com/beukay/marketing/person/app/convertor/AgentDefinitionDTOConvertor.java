package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.AgentDefinitionDTO;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

/**
 * Domain -> DTO 转换器
 */
@Mapper
public interface AgentDefinitionDTOConvertor {

    AgentDefinitionDTOConvertor INSTANCE = Mappers.getMapper(AgentDefinitionDTOConvertor.class);

    default AgentDefinitionDTO convert(AgentDefinition agentDefinition) {
        return AgentDefinitionDTO.builder()
                .id(agentDefinition.getId())
                .name(agentDefinition.getName())
                .description(agentDefinition.getDescription())
                .status(agentDefinition.getStatus())
                .agentDefId(agentDefinition.getAgentDefId())
                .behaviorDsl(agentDefinition.getBehaviorDsl())
                .modelConfig(agentDefinition.getModelConfig())
                .businessRules(agentDefinition.getBusinessRules())
                .skillIds(agentDefinition.getSkillIds())
                .version(agentDefinition.getVersion())
                .publishStatus(agentDefinition.getPublishStatus())
                .lastPublishAt(agentDefinition.getLastPublishAt())
                .lastPublishBy(agentDefinition.getLastPublishBy())
                .createAt(agentDefinition.getBaseFields() != null ? agentDefinition.getBaseFields().getCreateAt() : null)
                .createName(agentDefinition.getBaseFields() != null ? agentDefinition.getBaseFields().getCreateName() : null)
                .build();
    }

}
