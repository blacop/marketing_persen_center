package com.beukay.marketing.person.domain.agentIdentity.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 智能体身份查询条件
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentIdentityListCriteriaQuery {

    /**
     * 名称
     */
    private String name;

    /**
     * 状态
     */
    private String status;

    /**
     * 智能体类型(HUMAN/MACHINE/HYBRID)
     */
    private String agentType;

    /**
     * 所属团队/人员ID
     */
    private String ownerId;

}
