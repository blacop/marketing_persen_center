package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * AgentTrace数据对象
 */
@Data
@TableName("agent_trace")
public class AgentTraceDO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Integer isDeleted;

    private String nezhaTenantCode;

    private String name;

    private String description;

    private String status;

    private String traceId;

    private String agentId;

    private String taskDescription;

    private String toolCalls;

    private Long duration;

    private String result;

    private String errorMsg;

    private String traceType;

    private String traceStatus;

    private Long definitionId;

    private Long registryId;

    private Long publishRecordId;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private LocalDateTime createAt;

    private Long createBy;

    private String createName;

    private LocalDateTime updateAt;

    private Long updateBy;

    private String updateName;

}
