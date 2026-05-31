package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * AgentPublishRecord数据对象
 */
@Data
@TableName("agent_publish_record")
public class AgentPublishRecordDO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Integer isDeleted;

    private String nezhaTenantCode;

    private Long definitionId;

    private String definitionVersion;

    private String skillId;

    private String artifactPath;

    private String artifactChecksum;

    private String publisherType;

    private String publishStatus;

    private String errorMsg;

    private LocalDateTime createAt;

    private Long createBy;

    private String createName;

    private LocalDateTime updateAt;

    private Long updateBy;

    private String updateName;

}
