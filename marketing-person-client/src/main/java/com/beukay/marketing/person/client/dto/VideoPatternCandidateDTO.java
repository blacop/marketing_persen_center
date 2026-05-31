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
public class VideoPatternCandidateDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String patternCode;
    private String patternName;
    private BigDecimal matchScore;
    private String reasonJson;
    private Integer rankNo;
    private Boolean recommended;
}
