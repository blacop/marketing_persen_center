package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * AgentPublishRecord DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentPublishRecordDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Long definitionId;

    private String definitionVersion;

    private String skillId;

    private String artifactPath;

    private String artifactChecksum;

    private String publisherType;

    private String publishStatus;

    private String errorMsg;

    private LocalDateTime createAt;

    private String createName;

}
