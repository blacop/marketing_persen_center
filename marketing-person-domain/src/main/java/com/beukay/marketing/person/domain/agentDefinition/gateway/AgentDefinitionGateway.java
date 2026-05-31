package com.beukay.marketing.person.domain.agentDefinition.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinitionListCriteriaQuery;

/**
 * AgentDefinition Gateway
 */
public interface AgentDefinitionGateway {

    Long create(AgentDefinition agentDefinition);

    void update(AgentDefinition agentDefinition);

    AgentDefinition queryById(Long id);

    AgentDefinition queryByName(String name);

    AgentDefinition queryByAgentDefId(String agentDefId);

    PageInfo<AgentDefinition> listPage(AgentDefinitionListCriteriaQuery criteriaQuery, PageQuery pageQuery);

}
