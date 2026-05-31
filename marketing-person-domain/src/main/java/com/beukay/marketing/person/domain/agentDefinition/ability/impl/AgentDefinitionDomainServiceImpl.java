package com.beukay.marketing.person.domain.agentDefinition.ability.impl;

import com.beukay.marketing.person.domain.agentDefinition.ability.AgentDefinitionDomainService;
import com.beukay.marketing.person.domain.agentDefinition.gateway.AgentDefinitionGateway;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AgentDefinition领域服务实现
 */
@Service
@RequiredArgsConstructor
public class AgentDefinitionDomainServiceImpl implements AgentDefinitionDomainService {

    private final AgentDefinitionGateway agentDefinitionGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(AgentDefinition agentDefinition) {
        return agentDefinitionGateway.create(agentDefinition);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(AgentDefinition agentDefinition) {
        agentDefinitionGateway.update(agentDefinition);
    }

    @Override
    public AgentDefinition queryById(Long id) {
        return agentDefinitionGateway.queryById(id);
    }

    @Override
    public AgentDefinition queryByName(String name) {
        return agentDefinitionGateway.queryByName(name);
    }

    @Override
    public AgentDefinition queryByAgentDefId(String agentDefId) {
        return agentDefinitionGateway.queryByAgentDefId(agentDefId);
    }

}
