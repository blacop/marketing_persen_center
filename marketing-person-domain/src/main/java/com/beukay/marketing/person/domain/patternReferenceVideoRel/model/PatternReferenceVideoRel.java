package com.beukay.marketing.person.domain.patternReferenceVideoRel.model;

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
public class PatternReferenceVideoRel extends Entity<Long> {

    private String knowledgeId;
    private String videoId;
    private Long recordId;
    private String relationType;
    private BigDecimal referenceScore;
    private BigDecimal actualPerformanceScore;
}
