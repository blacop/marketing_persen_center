package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScriptBlueprintSectionDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Integer sectionNo;
    private String stageCode;
    private String stageName;
    private String goal;
    private String semanticIntent;
    private String queryText;
    private String mustCoverJson;
    private String preferredSignalsJson;
    private String avoidSignalsJson;
    private Integer durationMin;
    private Integer durationMax;
    private String narrationHint;
}
