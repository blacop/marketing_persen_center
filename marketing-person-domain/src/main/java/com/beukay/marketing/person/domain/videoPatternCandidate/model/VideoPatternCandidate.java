package com.beukay.marketing.person.domain.videoPatternCandidate.model;

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
public class VideoPatternCandidate extends Entity<Long> {

    private Long deconstructionResultId;
    private Long recordId;
    private String videoId;
    private String patternCode;
    private String patternName;
    private BigDecimal matchScore;
    private String reasonJson;
    private Integer rankNo;
    private Boolean recommended;
}
