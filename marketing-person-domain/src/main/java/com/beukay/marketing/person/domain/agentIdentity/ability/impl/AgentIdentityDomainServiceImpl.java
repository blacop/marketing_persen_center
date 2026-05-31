package com.beukay.marketing.person.domain.agentIdentity.ability.impl;

import com.beukay.marketing.person.domain.agentIdentity.ability.AgentIdentityDomainService;
import com.beukay.marketing.person.domain.agentIdentity.gateway.AgentIdentityGateway;
import com.beukay.marketing.person.domain.agentIdentity.model.AgentIdentity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 智能体身份领域服务实现
 */
@Service
@RequiredArgsConstructor
public class AgentIdentityDomainServiceImpl implements AgentIdentityDomainService {

    private final AgentIdentityGateway agentIdentityGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(AgentIdentity agentIdentity) {
        return agentIdentityGateway.create(agentIdentity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(AgentIdentity agentIdentity) {
        agentIdentityGateway.update(agentIdentity);
    }

    @Override
    public AgentIdentity queryById(Long id) {
        return agentIdentityGateway.queryById(id);
    }

    @Override
    public AgentIdentity queryByAgentUniqueId(String agentUniqueId) {
        return agentIdentityGateway.queryByAgentUniqueId(agentUniqueId);
    }

}
