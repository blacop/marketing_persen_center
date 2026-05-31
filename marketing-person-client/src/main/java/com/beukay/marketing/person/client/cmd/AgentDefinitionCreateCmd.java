package com.beukay.marketing.person.client.cmd;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * AgentDefinition创建命令
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentDefinitionCreateCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 名称
     */
    @NotBlank(message = "name不能为空")
    private String name;

    /**
     * 描述
     */
    private String description;

    /**
     * 生命周期状态
     */
    private String status;

    /**
     * 定义唯一标识
     */
    @NotBlank(message = "agentDefId不能为空")
    private String agentDefId;

    /**
     * 行为定义DSL/自然语言描述
     */
    @NotBlank(message = "behaviorDsl不能为空")
    private String behaviorDsl;

    /**
     * JSON模型配置
     */
    private String modelConfig;

    /**
     * JSON业务规则
     */
    private String businessRules;

    /**
     * 关联技能ID列表(逗号分隔)
     */
    private String skillIds;

    /**
     * 版本号
     */
    private String version;

}
