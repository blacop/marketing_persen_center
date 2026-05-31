package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 智能体身份 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentIdentityDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    private Long id;

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

    /**
     * 创建时间
     */
    private LocalDateTime createAt;

    /**
     * 创建人
     */
    private String createName;

}
