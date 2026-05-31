package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.app.convertor.AgentTraceDTOConvertor;
import com.beukay.marketing.person.client.dto.AgentTraceDTO;
import com.beukay.marketing.person.domain.agentTrace.gateway.AgentTraceGateway;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTrace;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import com.beukay.ai.common.exception.GenericBusinessException;
@Log4j2
@Component
@RequiredArgsConstructor
public class AgentTraceDetailQryExecutor {

    private final AgentTraceGateway agentTraceGateway;

    public AgentTraceDTO getAgentTrace(Long id) {
        AgentTrace trace = agentTraceGateway.queryById(id);
        if (trace == null) {
            throw new GenericBusinessException("AgentTrace不存在: " + id);
        }
        return AgentTraceDTOConvertor.INSTANCE.convert(trace);
    }

}
