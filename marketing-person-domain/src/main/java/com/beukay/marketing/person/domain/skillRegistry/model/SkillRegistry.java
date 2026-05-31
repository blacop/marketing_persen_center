package com.beukay.marketing.person.domain.skillRegistry.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * 技能注册领域实体
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SkillRegistry extends Entity<Long> {

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

}
