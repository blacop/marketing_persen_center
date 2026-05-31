package com.beukay.marketing.person.client.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.dto.AgentPublishRecordDTO;
import com.beukay.marketing.person.client.qry.AgentTraceDetailQry;
import com.beukay.marketing.person.client.qry.AgentPublishRecordPageQry;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * AgentPublishRecord Feign API
 */
public interface AgentPublishRecordFeign {

    @PostMapping("/agentPublishRecord/get")
    Result<AgentPublishRecordDTO> getAgentPublishRecord(@RequestBody @Valid AgentTraceDetailQry qry);

    @PostMapping("/agentPublishRecord/listPage")
    Result<PageInfo<AgentPublishRecordDTO>> listAgentPublishRecordPage(@RequestBody @Valid AgentPublishRecordPageQry qry);

}
