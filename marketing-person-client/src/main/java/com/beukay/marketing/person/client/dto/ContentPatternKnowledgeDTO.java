package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentPatternKnowledgeDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String knowledgeId;

    private String skuId;

    private String skuTag;

    private String marketingNode;

    private String targetAudience;

    private String hookType;

    private String patternType;

    private String recommendedOpening;

    private String recommendedSellingPoints;

    private String recommendedCta;

    private String recommendedScenes;

    private String negativeRules;

    private BigDecimal patternScore;

    private BigDecimal actualPerformanceScore;

    private String knowledgeJson;

    private String verificationStatus;

    private String status;

    private LocalDateTime createAt;

    private String createName;
}
