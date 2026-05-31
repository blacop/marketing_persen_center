package com.beukay.marketing.person.client.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.cmd.AgentIdentityCreateCmd;
import com.beukay.marketing.person.client.cmd.AgentIdentityUpdateCmd;
import com.beukay.marketing.person.client.dto.AgentIdentityDTO;
import com.beukay.marketing.person.client.qry.AgentIdentityDetailQry;
import com.beukay.marketing.person.client.qry.AgentIdentityPageQry;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * AgentIdentity Feign API 接口
 */
public interface AgentIdentityFeign {

    @PostMapping("/agentIdentity/create")
    Result<Long> createAgentIdentity(@RequestBody @Valid AgentIdentityCreateCmd cmd);

    @PostMapping("/agentIdentity/update")
    Result<Boolean> updateAgentIdentity(@RequestBody @Valid AgentIdentityUpdateCmd cmd);

    @PostMapping("/agentIdentity/get")
    Result<AgentIdentityDTO> getAgentIdentity(@RequestBody @Valid AgentIdentityDetailQry qry);

    @PostMapping("/agentIdentity/listPage")
    Result<PageInfo<AgentIdentityDTO>> listAgentIdentityPage(@RequestBody @Valid AgentIdentityPageQry qry);

}
