package com.beukay.marketing.person.client.cmd;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 创建智能体身份命令
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentIdentityCreateCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 名称
     */
    @NotNull(message = "name不能为空")
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
    @NotNull(message = "agentUniqueId不能为空")
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
