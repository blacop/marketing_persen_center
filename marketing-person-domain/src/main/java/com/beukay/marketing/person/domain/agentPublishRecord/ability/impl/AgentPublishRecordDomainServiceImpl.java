package com.beukay.marketing.person.domain.agentPublishRecord.ability.impl;

import com.beukay.marketing.person.domain.agentPublishRecord.ability.AgentPublishRecordDomainService;
import com.beukay.marketing.person.domain.agentPublishRecord.gateway.AgentPublishRecordGateway;
import com.beukay.marketing.person.domain.agentPublishRecord.model.AgentPublishRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AgentPublishRecord领域服务实现
 */
@Service
@RequiredArgsConstructor
public class AgentPublishRecordDomainServiceImpl implements AgentPublishRecordDomainService {

    private final AgentPublishRecordGateway agentPublishRecordGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(AgentPublishRecord agentPublishRecord) {
        return agentPublishRecordGateway.create(agentPublishRecord);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(AgentPublishRecord agentPublishRecord) {
        agentPublishRecordGateway.update(agentPublishRecord);
    }

    @Override
    public AgentPublishRecord queryById(Long id) {
        return agentPublishRecordGateway.queryById(id);
    }

}
