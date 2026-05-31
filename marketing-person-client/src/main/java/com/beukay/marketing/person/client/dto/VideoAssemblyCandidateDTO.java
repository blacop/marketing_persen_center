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
public class VideoAssemblyCandidateDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Integer sectionNo;
    private Long segmentId;
    private String videoId;
    private BigDecimal similarityScore;
    private String matchReasonJson;
    private Integer rankNo;
    private Boolean selected;
}
