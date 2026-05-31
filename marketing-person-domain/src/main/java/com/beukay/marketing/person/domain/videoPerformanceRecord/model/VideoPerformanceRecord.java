package com.beukay.marketing.person.domain.videoPerformanceRecord.model;

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
public class VideoPerformanceRecord extends Entity<Long> {

    private String videoId;
    private String accountId;
    private String accountName;
    private String title;
    private LocalDateTime publishTime;
    private String videoUrl;
    private Boolean isPromoted;
    private Long views;
    private Integer likes;
    private Integer comments;
    private Integer saves;
    private Integer shares;
    private Integer follows;
    private BigDecimal completionRate;
    private Integer avgWatchSec;
    private BigDecimal liveGmv;
    private Integer liveTraffic;
    private Integer liveOrders;
    private BigDecimal postSearchGmv;
    private String skuTag;
    private String hookType;
    private String contentPattern;
    private BigDecimal compositeScore;
}
