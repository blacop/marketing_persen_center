package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("video_deconstruction_result")
public class VideoDeconstructionResultDO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Integer isDeleted;
    private String nezhaTenantCode;
    private Long recordId;
    private String videoId;
    private String skuId;
    private String skuTag;
    private String hookType;
    private String sceneTags;
    private String sellingPointTags;
    private String ctaTags;
    private String titlePattern;
    private String emotionTags;
    private String targetAudienceTags;
    private String recommendedPatternCode;
    private String recommendedPatternName;
    private String recommendedPatternReason;
    private String patternDecisionJson;
    private String deconstructionJson;
    private String version;
    private BigDecimal actualPerformanceScore;
    private String verificationStatus;
    private String status;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
}
