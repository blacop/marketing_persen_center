package com.beukay.marketing.person.client.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.cmd.AgentTraceCreateCmd;
import com.beukay.marketing.person.client.dto.AgentTraceDTO;
import com.beukay.marketing.person.client.qry.AgentTraceDetailQry;
import com.beukay.marketing.person.client.qry.AgentTracePageQry;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * AgentTrace Feign API
 */
public interface AgentTraceFeign {

    @PostMapping("/agentTrace/create")
    Result<Long> createAgentTrace(@RequestBody @Valid AgentTraceCreateCmd cmd);

    @PostMapping("/agentTrace/get")
    Result<AgentTraceDTO> getAgentTrace(@RequestBody @Valid AgentTraceDetailQry qry);

    @PostMapping("/agentTrace/listPage")
    Result<PageInfo<AgentTraceDTO>> listAgentTracePage(@RequestBody @Valid AgentTracePageQry qry);

}
