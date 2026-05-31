package com.beukay.marketing.person.app.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.executor.AgentPublishRecordQryExecutor;
import com.beukay.marketing.person.client.api.AgentPublishRecordFeign;
import com.beukay.marketing.person.client.dto.AgentPublishRecordDTO;
import com.beukay.marketing.person.client.qry.AgentPublishRecordPageQry;
import com.beukay.marketing.person.client.qry.AgentTraceDetailQry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AgentPublishRecordController implements AgentPublishRecordFeign {

    private final AgentPublishRecordQryExecutor agentPublishRecordQryExecutor;

    @Override
    public Result<AgentPublishRecordDTO> getAgentPublishRecord(AgentTraceDetailQry qry) {
        return Result.success(agentPublishRecordQryExecutor.getAgentPublishRecord(qry.getId()));
    }

    @Override
    public Result<PageInfo<AgentPublishRecordDTO>> listAgentPublishRecordPage(AgentPublishRecordPageQry qry) {
        return Result.success(agentPublishRecordQryExecutor.listAgentPublishRecordPage(qry));
    }

}
