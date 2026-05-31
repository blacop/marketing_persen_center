package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("script_blueprint_section")
public class ScriptBlueprintSectionDO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
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
    private String nezhaTenantCode;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
    private Integer isDeleted;
}
