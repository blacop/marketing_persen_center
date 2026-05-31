package com.beukay.marketing.person.domain.agentIdentity.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * 智能体身份领域实体
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AgentIdentity extends Entity<Long> {

    /**
     * 名称
     */
    private String name;

    /**
     * 描述
     */
    private String description;

    /**
     * 状态
     */
    private String status;

    /**
     * 加密唯一ID
     */
    private String agentUniqueId;

    /**
     * 公钥
     */
    private String publicKey;

    /**
     * JSON授权策略
     */
    private String authPolicy;

    /**
     * 所属团队/人员ID
     */
    private String ownerId;

    /**
     * 智能体类型(HUMAN/MACHINE/HYBRID)
     */
    private String agentType;

}
