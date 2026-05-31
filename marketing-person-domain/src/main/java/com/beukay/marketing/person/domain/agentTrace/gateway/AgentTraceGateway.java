package com.beukay.marketing.person.domain.agentTrace.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTrace;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTraceListCriteriaQuery;

/**
 * AgentTrace Gateway
 */
public interface AgentTraceGateway {

    Long create(AgentTrace agentTrace);

    void update(AgentTrace agentTrace);

    AgentTrace queryById(Long id);

    AgentTrace queryByName(String name);

    PageInfo<AgentTrace> listPage(AgentTraceListCriteriaQuery criteriaQuery, PageQuery pageQuery);

}
