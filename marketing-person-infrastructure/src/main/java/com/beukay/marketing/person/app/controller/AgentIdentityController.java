package com.beukay.marketing.person.app.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.executor.AgentIdentityCmdExecutor;
import com.beukay.marketing.person.app.executor.AgentIdentityDetailQryExecutor;
import com.beukay.marketing.person.app.executor.AgentIdentityQryExecutor;
import com.beukay.marketing.person.client.api.AgentIdentityFeign;
import com.beukay.marketing.person.client.cmd.AgentIdentityCreateCmd;
import com.beukay.marketing.person.client.cmd.AgentIdentityUpdateCmd;
import com.beukay.marketing.person.client.dto.AgentIdentityDTO;
import com.beukay.marketing.person.client.qry.AgentIdentityDetailQry;
import com.beukay.marketing.person.client.qry.AgentIdentityPageQry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AgentIdentityController implements AgentIdentityFeign {

    private final AgentIdentityCmdExecutor agentIdentityCmdExecutor;
    private final AgentIdentityQryExecutor agentIdentityQryExecutor;
    private final AgentIdentityDetailQryExecutor agentIdentityDetailQryExecutor;

    @Override
    public Result<Long> createAgentIdentity(AgentIdentityCreateCmd cmd) {
        return Result.success(agentIdentityCmdExecutor.createAgentIdentity(cmd));
    }

    @Override
    public Result<Boolean> updateAgentIdentity(AgentIdentityUpdateCmd cmd) {
        return Result.success(agentIdentityCmdExecutor.updateAgentIdentity(cmd));
    }

    @Override
    public Result<AgentIdentityDTO> getAgentIdentity(AgentIdentityDetailQry qry) {
        return Result.success(agentIdentityDetailQryExecutor.getAgentIdentity(qry.getId()));
    }

    @Override
    public Result<PageInfo<AgentIdentityDTO>> listAgentIdentityPage(AgentIdentityPageQry qry) {
        return Result.success(agentIdentityQryExecutor.listAgentIdentityPage(qry));
    }

}
