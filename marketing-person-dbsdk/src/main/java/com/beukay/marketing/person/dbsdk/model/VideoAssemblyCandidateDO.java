package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("video_assembly_candidate")
public class VideoAssemblyCandidateDO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String taskCode;
    private Integer sectionNo;
    private Long segmentId;
    private String videoId;
    private BigDecimal similarityScore;
    private String matchReasonJson;
    private Integer rankNo;
    private Integer isSelected;
    private String nezhaTenantCode;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
    private Integer isDeleted;
}
