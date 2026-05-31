package com.beukay.marketing.person.app.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.executor.AgentTraceCmdExecutor;
import com.beukay.marketing.person.app.executor.AgentTraceDetailQryExecutor;
import com.beukay.marketing.person.app.executor.AgentTraceQryExecutor;
import com.beukay.marketing.person.client.api.AgentTraceFeign;
import com.beukay.marketing.person.client.cmd.AgentTraceCreateCmd;
import com.beukay.marketing.person.client.dto.AgentTraceDTO;
import com.beukay.marketing.person.client.qry.AgentTraceDetailQry;
import com.beukay.marketing.person.client.qry.AgentTracePageQry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AgentTraceController implements AgentTraceFeign {

    private final AgentTraceCmdExecutor agentTraceCmdExecutor;
    private final AgentTraceQryExecutor agentTraceQryExecutor;
    private final AgentTraceDetailQryExecutor agentTraceDetailQryExecutor;

    @Override
    public Result<Long> createAgentTrace(AgentTraceCreateCmd cmd) {
        return Result.success(agentTraceCmdExecutor.createAgentTrace(cmd));
    }

    @Override
    public Result<AgentTraceDTO> getAgentTrace(AgentTraceDetailQry qry) {
        return Result.success(agentTraceDetailQryExecutor.getAgentTrace(qry.getId()));
    }

    @Override
    public Result<PageInfo<AgentTraceDTO>> listAgentTracePage(AgentTracePageQry qry) {
        return Result.success(agentTraceQryExecutor.listAgentTracePage(qry));
    }

}
