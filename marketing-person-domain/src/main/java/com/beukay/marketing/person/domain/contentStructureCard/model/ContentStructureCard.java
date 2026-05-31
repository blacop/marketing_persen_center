package com.beukay.marketing.person.domain.contentStructureCard.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ContentStructureCard extends Entity<Long> {

    private String cardId;
    private String cardVersion;
    private String skuId;
    private String hookType;
    private String targetAudience;
    private String marketingNode;
    private String accountId;
    private String status;
    private String cardJson;
    private String openingHook;
    private Integer videoDurationSec;
    private String referenceVideoId;
    private String patternRankTop1;
    private String experimentKey;
    private BigDecimal actualLiveGmv;
    private BigDecimal actualCompletion;
    private Integer actualLiveTraffic;
    private LocalDateTime feedbackWrittenAt;
    private String agentTraceId;
    private String agentDefinitionId;
    private String logicTrace;
}
