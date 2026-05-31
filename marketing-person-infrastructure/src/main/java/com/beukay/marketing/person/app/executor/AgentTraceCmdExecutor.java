package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.Operator;
import com.beukay.marketing.person.client.cmd.AgentTraceCreateCmd;
import com.beukay.marketing.person.domain.agentTrace.ability.AgentTraceDomainService;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTrace;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

/**
 * AgentTrace命令执行器
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class AgentTraceCmdExecutor {

    private final AgentTraceDomainService agentTraceDomainService;

    public Long createAgentTrace(AgentTraceCreateCmd cmd) {
        AgentTrace agentTrace = AgentTrace.builder()
                .name(cmd.getName())
                .description(cmd.getDescription())
                .status(cmd.getStatus())
                .traceId(cmd.getTraceId())
                .agentId(cmd.getAgentId())
                .taskDescription(cmd.getTaskDescription())
                .toolCalls(cmd.getToolCalls())
                .duration(cmd.getDuration())
                .result(cmd.getResult())
                .errorMsg(cmd.getErrorMsg())
                .build();
        agentTrace.buildInsert(new Operator(0L, "system"));
        return agentTraceDomainService.create(agentTrace);
    }

}
