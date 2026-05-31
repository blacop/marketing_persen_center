package com.beukay.marketing.person.client.cmd;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * AgentRegistry创建命令
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentRegistryCreateCmd implements Serializable {

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
     * 关联AgentIdentity的加密ID
     */
    private String agentUniqueId;

    /**
     * 智能体分类
     */
    private String category;

    /**
     * 服务端点URL
     */
    private String endpointUrl;

    /**
     * 智能体类型
     */
    private String agentType;

    /**
     * 版本号
     */
    private String version;

    /**
     * 所属团队ID
     */
    private String ownerId;

}
