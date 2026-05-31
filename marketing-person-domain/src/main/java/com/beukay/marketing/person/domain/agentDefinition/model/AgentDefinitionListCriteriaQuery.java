package com.beukay.marketing.person.domain.agentDefinition.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AgentDefinition查询条件
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentDefinitionListCriteriaQuery {

    private String name;

    private String status;

    private String publishStatus;

}
