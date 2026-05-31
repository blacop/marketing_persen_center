package com.beukay.marketing.person.domain.contentPatternKnowledge.model;

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
public class ContentPatternKnowledge extends Entity<Long> {

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
    private String patternEmbedding;
    private String knowledgeJson;
    private String version;
    private String verificationStatus;
    private String status;
}
