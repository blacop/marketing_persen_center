package com.beukay.marketing.person.dbsdk.composition.model;

import lombok.Data;

import java.time.LocalDateTime;

/** render_job 表 */
@Data
public class RenderJobDO {

    private Long id;

    private Long projectId;
    private Integer totalCount;
    private Integer successCount;
    private Integer failedCount;
    private String status;
    private Integer progressPercent;
    private String currentStage;
    private String errorMsg;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private String mqMessageId;
    /** RenderConfig JSON */
    private String renderConfigJson;

    /** 八字段 */
    private String nezhaTenantCode;
    private Boolean isDeleted;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
}
