package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * AgentDefinition DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentDefinitionDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

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

    private LocalDateTime createAt;

    private String createName;

}
