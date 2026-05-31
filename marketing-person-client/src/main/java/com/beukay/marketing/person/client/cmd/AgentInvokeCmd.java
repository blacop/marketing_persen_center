package com.beukay.marketing.person.client.cmd;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * Agent 对话调用命令
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentInvokeCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    /** Agent 唯一ID（来自 agent_registry.agent_unique_id） */
    @NotBlank(message = "agentUniqueId不能为空")
    private String agentUniqueId;

    /** 本轮用户消息 */
    @NotBlank(message = "message不能为空")
    private String message;

    /** 历史对话（最近 N 轮，role=user/assistant） */
    private List<ConversationTurn> history;

    /** 单轮对话消息 */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationTurn implements Serializable {

        private static final long serialVersionUID = 1L;

        /** 角色：user 或 assistant */
        private String role;

        /** 消息内容 */
        private String content;
    }
}
