package com.beukay.marketing.person.dbsdk.model;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 技能注册数据对象
 */
@Data
public class SkillRegistryDO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Integer isDeleted;

    private String nezhaTenantCode;

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

    private Long createBy;

    private String createName;

    private LocalDateTime updateAt;

    private Long updateBy;

    private String updateName;

}
