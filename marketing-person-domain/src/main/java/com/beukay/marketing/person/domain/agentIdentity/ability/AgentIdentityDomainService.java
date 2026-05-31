package com.beukay.marketing.person.domain.agentIdentity.ability;

import com.beukay.marketing.person.domain.agentIdentity.model.AgentIdentity;

/**
 * 智能体身份领域服务接口
 */
public interface AgentIdentityDomainService {

    /**
     * 创建智能体身份
     */
    Long create(AgentIdentity agentIdentity);

    /**
     * 更新智能体身份
     */
    void update(AgentIdentity agentIdentity);

    /**
     * 根据ID查询智能体身份
     */
    AgentIdentity queryById(Long id);

    /**
     * 根据加密唯一ID查询智能体身份
     */
    AgentIdentity queryByAgentUniqueId(String agentUniqueId);

}
