package com.beukay.marketing.person.domain.agentPublishRecord.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * AgentPublishRecord领域实体
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AgentPublishRecord extends Entity<Long> {

    private Long definitionId;

    private String definitionVersion;

    private String skillId;

    private String artifactPath;

    private String artifactChecksum;

    private String publisherType;

    private String publishStatus;

    private String errorMsg;

}
