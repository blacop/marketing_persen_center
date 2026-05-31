package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 技能注册 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillRegistryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String name;

    private String description;

    private String status;

    private String skillId;

    private String category;

    private String source;

    private String mcpEndpoint;

    private String inputSchema;

    private String trustLevel;

    private String version;

    private String artifactPath;

    private String artifactChecksum;

    private String schemaVersion;

    private LocalDateTime createAt;

    private String createName;

}
