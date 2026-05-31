package com.beukay.marketing.person.domain.agentDefinition.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * AgentDefinition领域实体
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AgentDefinition extends Entity<Long> {

    private String name;

    private String description;

    private String status;

    private String agentDefId;

    private String behaviorDsl;

    private String modelConfig;

    private String businessRules;

    private String skillIds;

    private String version;

    private String publishStatus;

    private LocalDateTime lastPublishAt;

    private Long lastPublishBy;

}
