package com.beukay.marketing.person.domain.productTruth.model;

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
public class ProductTruth extends Entity<Long> {

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
}
