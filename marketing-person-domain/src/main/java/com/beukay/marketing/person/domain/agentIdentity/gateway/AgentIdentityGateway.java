package com.beukay.marketing.person.domain.agentIdentity.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.agentIdentity.model.AgentIdentity;
import com.beukay.marketing.person.domain.agentIdentity.model.AgentIdentityListCriteriaQuery;

/**
 * 智能体身份 Gateway 接口
 */
public interface AgentIdentityGateway {

    /**
     * 创建智能体身份
     */
    Long create(AgentIdentity agentIdentity);

    /**
     * 更新智能体身份
     */
    void update(AgentIdentity agentIdentity);

    /**
     * 根据ID查询
     */
    AgentIdentity queryById(Long id);

    /**
     * 根据加密唯一ID查询
     */
    AgentIdentity queryByAgentUniqueId(String agentUniqueId);

    /**
     * 分页查询
     */
    PageInfo<AgentIdentity> listPage(AgentIdentityListCriteriaQuery criteriaQuery, PageQuery pageQuery);

}
