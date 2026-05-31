package com.beukay.marketing.person.dbsdk.composition.model;

import lombok.Data;

import java.time.LocalDateTime;

/** source_video 表（视频拆解工作流的源视频） */
@Data
public class SourceVideoDO {

    private Long id;

    private String ossKey;
    private String originalName;
    private Long durationMs;
    private Long fileSize;
    private Integer width;
    private Integer height;
    /** JSON 字符串：[{startMs,endMs,category,name,memo}] */
    private String segmentsJson;
    /** DRAFT / EXPORTED */
    private String status;

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
