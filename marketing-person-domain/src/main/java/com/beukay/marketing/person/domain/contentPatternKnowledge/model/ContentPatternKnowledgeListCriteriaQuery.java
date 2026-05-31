package com.beukay.marketing.person.domain.contentPatternKnowledge.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentPatternKnowledgeListCriteriaQuery {

    private String skuId;

    private String marketingNode;

    private String hookType;

    private String verificationStatus;
}
