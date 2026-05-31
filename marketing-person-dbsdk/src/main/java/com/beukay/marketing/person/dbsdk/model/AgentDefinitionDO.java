package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * AgentDefinition数据对象
 */
@Data
@TableName("agent_definition")
public class AgentDefinitionDO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Integer isDeleted;

    private String nezhaTenantCode;

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

    private Long createBy;

    private String createName;

    private LocalDateTime updateAt;

    private Long updateBy;

    private String updateName;

}
