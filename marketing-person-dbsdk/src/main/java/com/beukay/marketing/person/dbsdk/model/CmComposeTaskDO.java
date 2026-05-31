package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cm_compose_task")
public class CmComposeTaskDO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String taskCode;
    private String collectionCode;
    private String mode;
    private String skuId;
    private String narrationUrl;
    private String sectionsJson;
    private String planJson;
    private BigDecimal totalDurationSec;
    private String resultVideoUrl;
    private String status;
    private String errorMsg;
    private String nezhaTenantCode;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
    private Integer isDeleted;
}
