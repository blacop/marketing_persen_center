package com.beukay.marketing.person.domain.scriptBlueprint.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ScriptBlueprintSection extends Entity<Long> {
    private String blueprintCode;
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
