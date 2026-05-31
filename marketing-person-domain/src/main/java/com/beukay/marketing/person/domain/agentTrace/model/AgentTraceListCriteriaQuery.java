package com.beukay.marketing.person.domain.agentTrace.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AgentTrace查询条件
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentTraceListCriteriaQuery {

    private String name;

    private String status;

    private String agentId;

    private String traceType;

    private String traceStatus;

    private Long definitionId;

}
