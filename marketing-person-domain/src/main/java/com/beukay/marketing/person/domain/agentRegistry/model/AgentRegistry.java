package com.beukay.marketing.person.domain.agentRegistry.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * AgentRegistry领域实体
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AgentRegistry extends Entity<Long> {

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

}
