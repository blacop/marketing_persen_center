package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("script_blueprint")
public class ScriptBlueprintDO implements Serializable {
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
    private String nezhaTenantCode;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
    private Integer isDeleted;
}
