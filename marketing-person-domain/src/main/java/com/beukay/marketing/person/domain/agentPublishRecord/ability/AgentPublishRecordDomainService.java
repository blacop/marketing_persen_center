package com.beukay.marketing.person.domain.agentPublishRecord.ability;

import com.beukay.marketing.person.domain.agentPublishRecord.model.AgentPublishRecord;

/**
 * AgentPublishRecord领域服务
 */
public interface AgentPublishRecordDomainService {

    Long create(AgentPublishRecord agentPublishRecord);

    void update(AgentPublishRecord agentPublishRecord);

    AgentPublishRecord queryById(Long id);

}
