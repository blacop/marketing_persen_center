package com.beukay.marketing.person.domain.agentRegistry.ability.impl;

import com.beukay.marketing.person.domain.agentRegistry.ability.AgentRegistryDomainService;
import com.beukay.marketing.person.domain.agentRegistry.gateway.AgentRegistryGateway;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AgentRegistryDomainServiceImpl implements AgentRegistryDomainService {

    private final AgentRegistryGateway agentRegistryGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(AgentRegistry agentRegistry) {
        return agentRegistryGateway.create(agentRegistry);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(AgentRegistry agentRegistry) {
        agentRegistryGateway.update(agentRegistry);
    }

    @Override
    public AgentRegistry queryById(Long id) {
        return agentRegistryGateway.queryById(id);
    }

    @Override
    public AgentRegistry queryByName(String name) {
        return agentRegistryGateway.queryByName(name);
    }

    @Override
    public AgentRegistry queryByAgentUniqueId(String agentUniqueId) {
        return agentRegistryGateway.queryByAgentUniqueId(agentUniqueId);
    }

}
