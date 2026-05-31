package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoDeconstructionDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Long recordId;
    private String videoId;
    private String skuId;
    private String skuTag;
    private String hookType;
    private String titlePattern;
    private String sceneTags;
    private String sellingPointTags;
    private String ctaTags;
    private String emotionTags;
    private String targetAudienceTags;
    private String recommendedPatternCode;
    private String recommendedPatternName;
    private String recommendedPatternReason;
    private String patternDecisionJson;
    private String deconstructionJson;
    private BigDecimal actualPerformanceScore;
    private String verificationStatus;
    private String status;
    private LocalDateTime createAt;
    private String createName;
    private List<VideoPatternCandidateDTO> patternCandidates;
    /** 片段级拆解结果（最小单元库） */
    private List<VideoSegmentDTO> segments;
}
