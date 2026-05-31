package com.beukay.marketing.person.app.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.executor.AgentRegistryCmdExecutor;
import com.beukay.marketing.person.app.executor.AgentRegistryDetailQryExecutor;
import com.beukay.marketing.person.app.executor.AgentRegistryQryExecutor;
import com.beukay.marketing.person.app.service.AgentInvokeAppService;
import com.beukay.marketing.person.client.api.AgentRegistryFeign;
import com.beukay.marketing.person.client.cmd.AgentInvokeCmd;
import com.beukay.marketing.person.client.cmd.AgentRegistryCreateCmd;
import com.beukay.marketing.person.client.cmd.AgentRegistryStatusCmd;
import com.beukay.marketing.person.client.cmd.AgentRegistryUpdateCmd;
import com.beukay.marketing.person.client.dto.AgentInvokeDTO;
import com.beukay.marketing.person.client.dto.AgentRegistryDTO;
import com.beukay.marketing.person.client.qry.AgentRegistryDetailQry;
import com.beukay.marketing.person.client.qry.AgentRegistryPageQry;
import com.beukay.marketing.person.client.qry.AgentRegistryUniqueIdQry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AgentRegistryController implements AgentRegistryFeign {

    private final AgentRegistryCmdExecutor agentRegistryCmdExecutor;
    private final AgentRegistryQryExecutor agentRegistryQryExecutor;
    private final AgentRegistryDetailQryExecutor agentRegistryDetailQryExecutor;
    private final AgentInvokeAppService agentInvokeAppService;

    @Override
    public Result<Long> createAgentRegistry(AgentRegistryCreateCmd cmd) {
        return Result.success(agentRegistryCmdExecutor.createAgentRegistry(cmd));
    }

    @Override
    public Result<Boolean> updateAgentRegistry(AgentRegistryUpdateCmd cmd) {
        return Result.success(agentRegistryCmdExecutor.updateAgentRegistry(cmd));
    }

    @Override
    public Result<AgentRegistryDTO> getAgentRegistry(AgentRegistryDetailQry qry) {
        return Result.success(agentRegistryDetailQryExecutor.getAgentRegistry(qry.getId()));
    }

    @Override
    public Result<AgentRegistryDTO> getAgentRegistryByAgentUniqueId(AgentRegistryUniqueIdQry qry) {
        return Result.success(agentRegistryDetailQryExecutor.getByAgentUniqueId(qry.getAgentUniqueId()));
    }

    @Override
    public Result<Boolean> activateAgentRegistry(AgentRegistryStatusCmd cmd) {
        return Result.success(agentRegistryCmdExecutor.updateStatus(cmd.getId(), "ACTIVE"));
    }

    @Override
    public Result<Boolean> suspendAgentRegistry(AgentRegistryStatusCmd cmd) {
        return Result.success(agentRegistryCmdExecutor.updateStatus(cmd.getId(), "SUSPENDED"));
    }

    @Override
    public Result<PageInfo<AgentRegistryDTO>> listAgentRegistryPage(AgentRegistryPageQry qry) {
        return Result.success(agentRegistryQryExecutor.listAgentRegistryPage(qry));
    }

    @Override
    public Result<AgentInvokeDTO> invokeAgent(AgentInvokeCmd cmd) {
        return Result.success(agentInvokeAppService.invoke(cmd));
    }

}
