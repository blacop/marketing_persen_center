package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.app.convertor.AgentIdentityDTOConvertor;
import com.beukay.marketing.person.client.dto.AgentIdentityDTO;
import com.beukay.marketing.person.domain.agentIdentity.gateway.AgentIdentityGateway;
import com.beukay.marketing.person.domain.agentIdentity.model.AgentIdentity;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import com.beukay.ai.common.exception.GenericBusinessException;
@Log4j2
@Component
@RequiredArgsConstructor
public class AgentIdentityDetailQryExecutor {

    private final AgentIdentityGateway agentIdentityGateway;

    public AgentIdentityDTO getAgentIdentity(Long id) {
        AgentIdentity agentIdentity = agentIdentityGateway.queryById(id);
        if (agentIdentity == null) {
            throw new GenericBusinessException("AgentIdentity不存在: " + id);
        }
        return AgentIdentityDTOConvertor.INSTANCE.convert(agentIdentity);
    }

}
