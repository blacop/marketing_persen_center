package com.beukay.marketing.person.app.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.executor.AgentDefinitionArchiveCmdExecutor;
import com.beukay.marketing.person.app.executor.AgentDefinitionCmdExecutor;
import com.beukay.marketing.person.app.executor.AgentDefinitionDetailQryExecutor;
import com.beukay.marketing.person.app.executor.AgentDefinitionPublishCmdExecutor;
import com.beukay.marketing.person.app.executor.AgentDefinitionQryExecutor;
import com.beukay.marketing.person.app.executor.AgentDefinitionUpdateCmdExecutor;
import com.beukay.marketing.person.client.api.AgentDefinitionFeign;
import com.beukay.marketing.person.client.cmd.AgentDefinitionArchiveCmd;
import com.beukay.marketing.person.client.cmd.AgentDefinitionCreateCmd;
import com.beukay.marketing.person.client.cmd.AgentDefinitionPublishCmd;
import com.beukay.marketing.person.client.cmd.AgentDefinitionRetryPublishCmd;
import com.beukay.marketing.person.client.cmd.AgentDefinitionUpdateCmd;
import com.beukay.marketing.person.client.dto.AgentDefinitionDTO;
import com.beukay.marketing.person.client.dto.AgentDefinitionPublishDTO;
import com.beukay.marketing.person.client.qry.AgentDefinitionDetailQry;
import com.beukay.marketing.person.client.qry.AgentDefinitionPageQry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AgentDefinitionController implements AgentDefinitionFeign {

    private final AgentDefinitionCmdExecutor agentDefinitionCmdExecutor;
    private final AgentDefinitionUpdateCmdExecutor agentDefinitionUpdateCmdExecutor;
    private final AgentDefinitionDetailQryExecutor agentDefinitionDetailQryExecutor;
    private final AgentDefinitionQryExecutor agentDefinitionQryExecutor;
    private final AgentDefinitionPublishCmdExecutor agentDefinitionPublishCmdExecutor;
    private final AgentDefinitionArchiveCmdExecutor agentDefinitionArchiveCmdExecutor;

    @Override
    public Result<Long> createAgentDefinition(AgentDefinitionCreateCmd cmd) {
        return Result.success(agentDefinitionCmdExecutor.createAgentDefinition(cmd));
    }

    @Override
    public Result<Boolean> updateAgentDefinition(AgentDefinitionUpdateCmd cmd) {
        return Result.success(agentDefinitionUpdateCmdExecutor.updateAgentDefinition(cmd));
    }

    @Override
    public Result<AgentDefinitionDTO> getAgentDefinition(AgentDefinitionDetailQry qry) {
        return Result.success(agentDefinitionDetailQryExecutor.getAgentDefinition(qry.getId()));
    }

    @Override
    public Result<PageInfo<AgentDefinitionDTO>> listAgentDefinitionPage(AgentDefinitionPageQry qry) {
        return Result.success(agentDefinitionQryExecutor.listAgentDefinitionPage(qry));
    }

    @Override
    public Result<AgentDefinitionPublishDTO> publishAgentDefinition(AgentDefinitionPublishCmd cmd) {
        return Result.success(agentDefinitionPublishCmdExecutor.publish(cmd.getDefinitionId(), cmd.getPublishVersion()));
    }

    @Override
    public Result<AgentDefinitionPublishDTO> retryPublishAgentDefinition(AgentDefinitionRetryPublishCmd cmd) {
        return Result.success(agentDefinitionPublishCmdExecutor.retryPublish(cmd.getDefinitionId()));
    }

    @Override
    public Result<Boolean> archiveAgentDefinition(AgentDefinitionArchiveCmd cmd) {
        return Result.success(agentDefinitionArchiveCmdExecutor.archive(cmd.getDefinitionId()));
    }

}
