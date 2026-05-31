package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.AgentTraceDTO;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTrace;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

/**
 * Domain -> DTO 转换器
 */
@Mapper
public interface AgentTraceDTOConvertor {

    AgentTraceDTOConvertor INSTANCE = Mappers.getMapper(AgentTraceDTOConvertor.class);

    default AgentTraceDTO convert(AgentTrace agentTrace) {
        return AgentTraceDTO.builder()
                .id(agentTrace.getId())
                .name(agentTrace.getName())
                .description(agentTrace.getDescription())
                .status(agentTrace.getStatus())
                .traceId(agentTrace.getTraceId())
                .agentId(agentTrace.getAgentId())
                .taskDescription(agentTrace.getTaskDescription())
                .toolCalls(agentTrace.getToolCalls())
                .duration(agentTrace.getDuration())
                .result(agentTrace.getResult())
                .errorMsg(agentTrace.getErrorMsg())
                .traceType(agentTrace.getTraceType())
                .traceStatus(agentTrace.getTraceStatus())
                .definitionId(agentTrace.getDefinitionId())
                .registryId(agentTrace.getRegistryId())
                .publishRecordId(agentTrace.getPublishRecordId())
                .startAt(agentTrace.getStartAt())
                .endAt(agentTrace.getEndAt())
                .createAt(agentTrace.getBaseFields() != null ? agentTrace.getBaseFields().getCreateAt() : null)
                .createName(agentTrace.getBaseFields() != null ? agentTrace.getBaseFields().getCreateName() : null)
                .build();
    }

}
