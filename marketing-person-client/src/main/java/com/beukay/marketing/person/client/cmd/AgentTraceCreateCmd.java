package com.beukay.marketing.person.client.cmd;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * AgentTrace创建命令
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentTraceCreateCmd implements Serializable {

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
     * 追踪唯一ID
     */
    private String traceId;

    /**
     * 执行智能体ID
     */
    private String agentId;

    /**
     * 任务描述
     */
    private String taskDescription;

    /**
     * JSON工具调用记录
     */
    private String toolCalls;

    /**
     * 执行耗时(ms)
     */
    private Long duration;

    /**
     * 执行结果摘要
     */
    private String result;

    /**
     * 错误信息
     */
    private String errorMsg;

}
