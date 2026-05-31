package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.app.convertor.AgentRegistryDTOConvertor;
import com.beukay.marketing.person.client.dto.AgentRegistryDTO;
import com.beukay.marketing.person.domain.agentRegistry.gateway.AgentRegistryGateway;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import com.beukay.ai.common.exception.GenericBusinessException;
@Log4j2
@Component
@RequiredArgsConstructor
public class AgentRegistryDetailQryExecutor {

    private final AgentRegistryGateway agentRegistryGateway;

    public AgentRegistryDTO getAgentRegistry(Long id) {
        AgentRegistry registry = agentRegistryGateway.queryById(id);
        if (registry == null) {
            throw new GenericBusinessException("AgentRegistry不存在: " + id);
        }
        return AgentRegistryDTOConvertor.INSTANCE.convert(registry);
    }

    public AgentRegistryDTO getByAgentUniqueId(String agentUniqueId) {
        AgentRegistry registry = agentRegistryGateway.queryByAgentUniqueId(agentUniqueId);
        if (registry == null) {
            throw new GenericBusinessException("AgentRegistry不存在, agentUniqueId=" + agentUniqueId);
        }
        return AgentRegistryDTOConvertor.INSTANCE.convert(registry);
    }

}
