package com.beukay.marketing.person.client.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.cmd.AgentInvokeCmd;
import com.beukay.marketing.person.client.cmd.AgentRegistryCreateCmd;
import com.beukay.marketing.person.client.cmd.AgentRegistryStatusCmd;
import com.beukay.marketing.person.client.cmd.AgentRegistryUpdateCmd;
import com.beukay.marketing.person.client.dto.AgentInvokeDTO;
import com.beukay.marketing.person.client.dto.AgentRegistryDTO;
import com.beukay.marketing.person.client.qry.AgentRegistryDetailQry;
import com.beukay.marketing.person.client.qry.AgentRegistryPageQry;
import com.beukay.marketing.person.client.qry.AgentRegistryUniqueIdQry;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * AgentRegistry Feign API
 */
public interface AgentRegistryFeign {

    @PostMapping("/agentRegistry/create")
    Result<Long> createAgentRegistry(@RequestBody @Valid AgentRegistryCreateCmd cmd);

    @PostMapping("/agentRegistry/update")
    Result<Boolean> updateAgentRegistry(@RequestBody @Valid AgentRegistryUpdateCmd cmd);

    @PostMapping("/agentRegistry/get")
    Result<AgentRegistryDTO> getAgentRegistry(@RequestBody @Valid AgentRegistryDetailQry qry);

    @PostMapping("/agentRegistry/getByAgentUniqueId")
    Result<AgentRegistryDTO> getAgentRegistryByAgentUniqueId(@RequestBody @Valid AgentRegistryUniqueIdQry qry);

    @PostMapping("/agentRegistry/activate")
    Result<Boolean> activateAgentRegistry(@RequestBody @Valid AgentRegistryStatusCmd cmd);

    @PostMapping("/agentRegistry/suspend")
    Result<Boolean> suspendAgentRegistry(@RequestBody @Valid AgentRegistryStatusCmd cmd);

    @PostMapping("/agentRegistry/listPage")
    Result<PageInfo<AgentRegistryDTO>> listAgentRegistryPage(@RequestBody @Valid AgentRegistryPageQry qry);

    @PostMapping("/agentRegistry/invoke")
    Result<AgentInvokeDTO> invokeAgent(@RequestBody @Valid AgentInvokeCmd cmd);

}
