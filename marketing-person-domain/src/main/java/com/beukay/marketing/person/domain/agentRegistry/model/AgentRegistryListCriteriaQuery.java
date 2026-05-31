package com.beukay.marketing.person.domain.agentRegistry.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AgentRegistry查询条件
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentRegistryListCriteriaQuery {

    /**
     * 名称
     */
    private String name;

    /**
     * 状态
     */
    private String status;

    /**
     * 智能体分类
     */
    private String category;

    /**
     * 智能体类型
     */
    private String agentType;

}
