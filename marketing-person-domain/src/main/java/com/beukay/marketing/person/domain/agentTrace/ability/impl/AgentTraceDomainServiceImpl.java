package com.beukay.marketing.person.domain.agentTrace.ability.impl;

import com.beukay.marketing.person.domain.agentTrace.ability.AgentTraceDomainService;
import com.beukay.marketing.person.domain.agentTrace.gateway.AgentTraceGateway;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTrace;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AgentTrace领域服务实现
 */
@Service
@RequiredArgsConstructor
public class AgentTraceDomainServiceImpl implements AgentTraceDomainService {

    private final AgentTraceGateway agentTraceGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(AgentTrace agentTrace) {
        return agentTraceGateway.create(agentTrace);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(AgentTrace agentTrace) {
        agentTraceGateway.update(agentTrace);
    }

    @Override
    public AgentTrace queryById(Long id) {
        return agentTraceGateway.queryById(id);
    }

    @Override
    public AgentTrace queryByName(String name) {
        return agentTraceGateway.queryByName(name);
    }

}
