package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CmVideoSegmentDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String segmentCode;
    private String collectionCode;
    private String chapterCode;
    private String videoUrl;
    private BigDecimal startSec;
    private BigDecimal endSec;
    private BigDecimal durationSec;
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
