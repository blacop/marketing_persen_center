package com.beukay.marketing.person.domain.agentPublishRecord.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AgentPublishRecord查询条件
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentPublishRecordListCriteriaQuery {

    private Long definitionId;

    private String publishStatus;

}
