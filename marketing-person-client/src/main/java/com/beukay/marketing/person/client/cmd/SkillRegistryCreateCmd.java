package com.beukay.marketing.person.client.cmd;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 创建技能注册命令
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillRegistryCreateCmd implements Serializable {

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
     * 技能唯一标识
     */
    @NotNull(message = "skillId不能为空")
    private String skillId;

    /**
     * 技能分类
     */
    private String category;

    /**
     * 来源(BUILTIN/LOCAL/HUB/MCP)
     */
    private String source;

    /**
     * MCP端点URL（预留，可为空）
     */
    private String mcpEndpoint;

    /**
     * JSON输入模式
     */
    private String inputSchema;

    /**
     * 信任级别
     */
    private String trustLevel;

    /**
     * 版本号
     */
    private String version;

}
