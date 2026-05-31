package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.AgentTraceDO;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTrace;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

/**
 * Domain <-> DO 转换器
 */
@Mapper(uses = BooleanStrategy.class)
public interface AgentTraceConvertor extends BaseConvertor<AgentTrace, AgentTraceDO> {

    AgentTraceConvertor INSTANCE = Mappers.getMapper(AgentTraceConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "traceId", source = "traceId")
    @Mapping(target = "agentId", source = "agentId")
    @Mapping(target = "taskDescription", source = "taskDescription")
    @Mapping(target = "toolCalls", source = "toolCalls")
    @Mapping(target = "duration", source = "duration")
    @Mapping(target = "result", source = "result")
    @Mapping(target = "errorMsg", source = "errorMsg")
    @Mapping(target = "traceType", source = "traceType")
    @Mapping(target = "traceStatus", source = "traceStatus")
    @Mapping(target = "definitionId", source = "definitionId")
    @Mapping(target = "registryId", source = "registryId")
    @Mapping(target = "publishRecordId", source = "publishRecordId")
    @Mapping(target = "startAt", source = "startAt")
    @Mapping(target = "endAt", source = "endAt")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    AgentTraceDO to(AgentTrace agentTrace);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "traceId", source = "traceId")
    @Mapping(target = "agentId", source = "agentId")
    @Mapping(target = "taskDescription", source = "taskDescription")
    @Mapping(target = "toolCalls", source = "toolCalls")
    @Mapping(target = "duration", source = "duration")
    @Mapping(target = "result", source = "result")
    @Mapping(target = "errorMsg", source = "errorMsg")
    @Mapping(target = "traceType", source = "traceType")
    @Mapping(target = "traceStatus", source = "traceStatus")
    @Mapping(target = "definitionId", source = "definitionId")
    @Mapping(target = "registryId", source = "registryId")
    @Mapping(target = "publishRecordId", source = "publishRecordId")
    @Mapping(target = "startAt", source = "startAt")
    @Mapping(target = "endAt", source = "endAt")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "operator", ignore = true)
    AgentTrace from(AgentTraceDO doAgentTrace);

}
