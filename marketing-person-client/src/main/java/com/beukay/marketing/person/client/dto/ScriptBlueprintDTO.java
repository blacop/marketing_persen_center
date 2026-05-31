package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScriptBlueprintDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
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
    private LocalDateTime createAt;
    private String createName;
    private List<ScriptTemplateCandidateDTO> templateCandidates;
    private List<ScriptBlueprintSectionDTO> sections;
}
