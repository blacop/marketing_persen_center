package com.beukay.marketing.person.domain.agentRegistry.ability;

import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistry;

/**
 * AgentRegistry领域服务
 */
public interface AgentRegistryDomainService {

    Long create(AgentRegistry agentRegistry);

    void update(AgentRegistry agentRegistry);

    AgentRegistry queryById(Long id);

    AgentRegistry queryByName(String name);

    AgentRegistry queryByAgentUniqueId(String agentUniqueId);

}
