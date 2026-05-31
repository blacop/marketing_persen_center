package com.beukay.marketing.person.domain.cutmatrix.collection.model;

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
public class CmCollection extends Entity<Long> {
    private String collectionCode;
    private String name;
    private String skuId;
    private String mode;
}
