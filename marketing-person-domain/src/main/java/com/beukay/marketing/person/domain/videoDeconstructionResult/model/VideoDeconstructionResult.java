package com.beukay.marketing.person.domain.videoDeconstructionResult.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class VideoDeconstructionResult extends Entity<Long> {

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
}
