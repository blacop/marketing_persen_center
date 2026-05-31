package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("video_performance_record")
public class VideoPerformanceRecordDO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Integer isDeleted;
    private String nezhaTenantCode;
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
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
}
