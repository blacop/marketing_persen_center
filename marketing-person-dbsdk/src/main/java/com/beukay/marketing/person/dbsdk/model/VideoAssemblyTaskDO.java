package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("video_assembly_task")
public class VideoAssemblyTaskDO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String taskCode;
    private String blueprintCode;
    private String status;
    private String platform;
    private Integer targetDuration;
    private String resultVideoUrl;
    private String interventionStatus;
    private String summaryJson;
    private String nezhaTenantCode;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
    private Integer isDeleted;
}
