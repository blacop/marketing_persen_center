package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cm_video_segment")
public class CmVideoSegmentDO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String segmentCode;
    private String collectionCode;
    private String chapterCode;
    private String videoUrl;
    private BigDecimal startSec;
    private BigDecimal endSec;
    private BigDecimal durationSec;
    private Integer width;
    private Integer height;
    private BigDecimal fps;
    private Integer noMirror;
    private Integer orderNo;
    private String stageCode;
    private String sceneTags;
    private String sellingPointTags;
    private String hookType;
    private String caption;
    private String sourceType;
    private String sourceSegmentId;
    private String sourceVideoId;
    private String nezhaTenantCode;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
    private Integer isDeleted;
}
