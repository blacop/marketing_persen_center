package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cm_ingest_task")
public class CmIngestTaskDO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String taskCode;
    private String sourceUrl;
    private String title;
    private String coverAssetCode;
    private String videoAssetCode;
    private String audioAssetCode;
    private BigDecimal durationSec;
    private Integer width;
    private Integer height;
    private String qualityLabel;
    private String downloadStatus;
    private String downloadError;
    private String scriptText;
    private String scriptStatus;
    private String scriptError;
    private Integer autoStripEmoji;
    private String nezhaTenantCode;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
    private Integer isDeleted;
}
