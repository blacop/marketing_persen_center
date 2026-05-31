package com.beukay.marketing.person.domain.agentTrace.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * AgentTrace领域实体
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AgentTrace extends Entity<Long> {

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

}
