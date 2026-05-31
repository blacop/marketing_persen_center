package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("product_truth")
public class ProductTruthDO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Integer isDeleted;
    private String nezhaTenantCode;
    private String skuId;
    private String productName;
    private String category;
    private String priceRange;
    private String coreBenefits;
    private String evidencePoints;
    private String targetSkinType;
    private String forbiddenClaims;
    private String promotionMechanisms;
    private String preferredScenes;
    private String status;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
}
