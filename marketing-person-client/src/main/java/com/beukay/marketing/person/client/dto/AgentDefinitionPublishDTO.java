package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * AgentDefinition发布结果DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentDefinitionPublishDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long publishRecordId;

    private String traceId;

    private String skillId;

    private Long agentRegistryId;

    private String publishStatus;

}
