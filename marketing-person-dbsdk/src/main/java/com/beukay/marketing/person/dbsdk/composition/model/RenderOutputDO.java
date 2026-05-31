package com.beukay.marketing.person.dbsdk.composition.model;

import lombok.Data;

import java.time.LocalDateTime;

/** render_output 表 */
@Data
public class RenderOutputDO {

    private Long id;

    private Long jobId;
    private Long projectId;
    private String planHash;
    /** JSON 字符串 */
    private String planSnapshot;
    private String ossKey;
    private Long durationMs;
    private Integer width;
    private Integer height;
    private Long fileSize;
    private String status;
    private String errorMsg;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;

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
