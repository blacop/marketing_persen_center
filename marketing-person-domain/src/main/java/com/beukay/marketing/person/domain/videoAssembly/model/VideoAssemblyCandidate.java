package com.beukay.marketing.person.domain.videoAssembly.model;

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
public class VideoAssemblyCandidate extends Entity<Long> {
    private String taskCode;
    private Integer sectionNo;
    private Long segmentId;
    private String videoId;
    private BigDecimal similarityScore;
    private String matchReasonJson;
    private Integer rankNo;
    private Boolean selected;
}
