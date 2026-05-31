package com.beukay.marketing.person.client.qry;

import com.beukay.ai.common.entity.PageQuery;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * AgentTrace分页查询
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentTracePageQry implements Serializable {

    private static final long serialVersionUID = 1L;

    private String name;

    private String status;

    private String agentId;

    private String traceType;

    private String traceStatus;

    private Long definitionId;

    @Valid
    private PageQuery pageQuery;

}
