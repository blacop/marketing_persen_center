package com.beukay.marketing.person.domain.agentPublishRecord.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.agentPublishRecord.model.AgentPublishRecord;
import com.beukay.marketing.person.domain.agentPublishRecord.model.AgentPublishRecordListCriteriaQuery;

/**
 * AgentPublishRecord Gateway
 */
public interface AgentPublishRecordGateway {

    Long create(AgentPublishRecord agentPublishRecord);

    void update(AgentPublishRecord agentPublishRecord);

    AgentPublishRecord queryById(Long id);

    PageInfo<AgentPublishRecord> listPage(AgentPublishRecordListCriteriaQuery criteriaQuery, PageQuery pageQuery);

}
