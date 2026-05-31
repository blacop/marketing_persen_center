package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("content_pattern_knowledge")
public class ContentPatternKnowledgeDO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Integer isDeleted;
    private String nezhaTenantCode;
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
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
}
