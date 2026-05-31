package com.beukay.marketing.person.domain.agentDefinition.ability;

import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;

/**
 * AgentDefinition领域服务
 */
public interface AgentDefinitionDomainService {

    Long create(AgentDefinition agentDefinition);

    void update(AgentDefinition agentDefinition);

    AgentDefinition queryById(Long id);

    AgentDefinition queryByName(String name);

    AgentDefinition queryByAgentDefId(String agentDefId);

}
