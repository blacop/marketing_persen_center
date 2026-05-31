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
public class ScriptBlueprint extends Entity<Long> {
    private String blueprintCode;
    private String skuId;
    private String categoryCode;
    private String marketingGoal;
    private String marketingNode;
    private String targetAudience;
    private String platform;
    private String accountId;
    private String status;
    private String blueprintSummary;
    private String recommendedTemplateCode;
    private String recommendedTemplateName;
    private String recommendedTemplateReason;
    private String templateCandidatesJson;
    private String blueprintJson;
    private String logicTrace;
    private String autoFlowStatus;
}
