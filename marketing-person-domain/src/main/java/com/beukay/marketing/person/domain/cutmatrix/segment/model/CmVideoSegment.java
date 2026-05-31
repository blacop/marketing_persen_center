package com.beukay.marketing.person.domain.cutmatrix.segment.model;

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
public class CmVideoSegment extends Entity<Long> {
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
}
