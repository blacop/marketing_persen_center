package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * AgentTrace DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentTraceDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String name;

    private String description;

    private String status;

    private String traceId;

    private String agentId;

    private String taskDescription;

    private String toolCalls;

    private Long duration;

    private String result;

    private String errorMsg;

    private String traceType;

    private String traceStatus;

    private Long definitionId;

    private Long registryId;

    private Long publishRecordId;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private LocalDateTime createAt;

    private String createName;

}
