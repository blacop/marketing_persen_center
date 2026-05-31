package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("content_structure_card")
public class ContentStructureCardDO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Integer isDeleted;
    private String nezhaTenantCode;
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
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
}
