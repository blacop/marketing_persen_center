package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 智能体身份数据对象
 */
@Data
@TableName("agent_identity")
public class AgentIdentityDO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * id
     */
    private Long id;

    /**
     * 是否删除
     */
    private Integer isDeleted;

    /**
     * 业务租户编码
     */
    private String nezhaTenantCode;

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
     * 创建人id
     */
    private Long createBy;

    /**
     * 创建人名称
     */
    private String createName;

    /**
     * 更新时间
     */
    private LocalDateTime updateAt;

    /**
     * 更新人id
     */
    private Long updateBy;

    /**
     * 更新人名称
     */
    private String updateName;

}
