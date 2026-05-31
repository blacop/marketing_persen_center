package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("pattern_reference_video_rel")
public class PatternReferenceVideoRelDO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Integer isDeleted;
    private String nezhaTenantCode;
    private String knowledgeId;
    private String videoId;
    private Long recordId;
    private String relationType;
    private BigDecimal referenceScore;
    private BigDecimal actualPerformanceScore;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
}
