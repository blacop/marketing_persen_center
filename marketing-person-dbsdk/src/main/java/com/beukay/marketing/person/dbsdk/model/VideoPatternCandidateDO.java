package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("video_pattern_candidate")
public class VideoPatternCandidateDO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Long deconstructionResultId;
    private Long recordId;
    private String videoId;
    private String patternCode;
    private String patternName;
    private BigDecimal matchScore;
    private String reasonJson;
    private Integer rankNo;
    private Integer isRecommended;
    private String nezhaTenantCode;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
    private Integer isDeleted;
}
