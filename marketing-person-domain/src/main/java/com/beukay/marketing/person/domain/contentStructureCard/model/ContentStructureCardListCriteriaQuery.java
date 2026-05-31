package com.beukay.marketing.person.domain.contentStructureCard.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentStructureCardListCriteriaQuery {

    private String skuId;
    private String hookType;
    private String marketingNode;
    private String status;
}
