package com.beukay.marketing.person.domain.agentTrace.ability;

import com.beukay.marketing.person.domain.agentTrace.model.AgentTrace;

/**
 * AgentTrace领域服务
 */
public interface AgentTraceDomainService {

    Long create(AgentTrace agentTrace);

    void update(AgentTrace agentTrace);

    AgentTrace queryById(Long id);

    AgentTrace queryByName(String name);

}
