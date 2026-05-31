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
public class ScriptTemplateCandidateDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private String templateCode;
    private String templateName;
    private BigDecimal matchScore;
    private String reasonJson;
    private Integer rankNo;
    private Boolean recommended;
}
