package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * AgentRegistry DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentRegistryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String name;

    private String description;

    private String status;

    private String agentUniqueId;

    private String category;

    private String endpointUrl;

    private String agentType;

    private String version;

    private String ownerId;

    private Long definitionId;

    private String definitionVersion;

    private Long identityId;

    private String currentSkillId;

    private String endpointType;

    private LocalDateTime createAt;

    private String createName;

}
