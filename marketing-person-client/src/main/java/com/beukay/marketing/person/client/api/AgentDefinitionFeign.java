package com.beukay.marketing.person.client.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.cmd.AgentDefinitionArchiveCmd;
import com.beukay.marketing.person.client.cmd.AgentDefinitionCreateCmd;
import com.beukay.marketing.person.client.cmd.AgentDefinitionPublishCmd;
import com.beukay.marketing.person.client.cmd.AgentDefinitionRetryPublishCmd;
import com.beukay.marketing.person.client.cmd.AgentDefinitionUpdateCmd;
import com.beukay.marketing.person.client.dto.AgentDefinitionDTO;
import com.beukay.marketing.person.client.dto.AgentDefinitionPublishDTO;
import com.beukay.marketing.person.client.qry.AgentDefinitionDetailQry;
import com.beukay.marketing.person.client.qry.AgentDefinitionPageQry;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * AgentDefinition Feign API
 */
public interface AgentDefinitionFeign {

    @PostMapping("/agentDefinition/create")
    Result<Long> createAgentDefinition(@RequestBody @Valid AgentDefinitionCreateCmd cmd);

    @PostMapping("/agentDefinition/update")
    Result<Boolean> updateAgentDefinition(@RequestBody @Valid AgentDefinitionUpdateCmd cmd);

    @PostMapping("/agentDefinition/get")
    Result<AgentDefinitionDTO> getAgentDefinition(@RequestBody @Valid AgentDefinitionDetailQry qry);

    @PostMapping("/agentDefinition/listPage")
    Result<PageInfo<AgentDefinitionDTO>> listAgentDefinitionPage(@RequestBody @Valid AgentDefinitionPageQry qry);

    @PostMapping("/agentDefinition/publish")
    Result<AgentDefinitionPublishDTO> publishAgentDefinition(@RequestBody @Valid AgentDefinitionPublishCmd cmd);

    @PostMapping("/agentDefinition/retryPublish")
    Result<AgentDefinitionPublishDTO> retryPublishAgentDefinition(@RequestBody @Valid AgentDefinitionRetryPublishCmd cmd);

    @PostMapping("/agentDefinition/archive")
    Result<Boolean> archiveAgentDefinition(@RequestBody @Valid AgentDefinitionArchiveCmd cmd);

}
