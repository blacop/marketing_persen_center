package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("cm_collection")
public class CmCollectionDO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String collectionCode;
    private String name;
    private String skuId;
    private String mode;
    private String nezhaTenantCode;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
    private Integer isDeleted;
}
