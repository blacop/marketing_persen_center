package com.beukay.marketing.person.domain.agentRegistry.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistry;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistryListCriteriaQuery;

/**
 * AgentRegistry Gateway
 */
public interface AgentRegistryGateway {

    Long create(AgentRegistry agentRegistry);

    void update(AgentRegistry agentRegistry);

    AgentRegistry queryById(Long id);

    AgentRegistry queryByName(String name);

    AgentRegistry queryByAgentUniqueId(String agentUniqueId);

    PageInfo<AgentRegistry> listPage(AgentRegistryListCriteriaQuery criteriaQuery, PageQuery pageQuery);

}
