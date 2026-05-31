package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * AgentRegistry数据对象
 */
@Data
@TableName("agent_registry")
public class AgentRegistryDO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Integer isDeleted;

    private String nezhaTenantCode;

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

    private Long createBy;

    private String createName;

    private LocalDateTime updateAt;

    private Long updateBy;

    private String updateName;

}
