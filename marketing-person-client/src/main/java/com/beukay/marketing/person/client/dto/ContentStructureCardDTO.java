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
public class ContentStructureCardDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
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
    private String logicTrace;
    private BigDecimal actualLiveGmv;
    private BigDecimal actualCompletion;
    private Integer actualLiveTraffic;
    private LocalDateTime feedbackWrittenAt;
    private LocalDateTime createAt;
    private String createName;
}
