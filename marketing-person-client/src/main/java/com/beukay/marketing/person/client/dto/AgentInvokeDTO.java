package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Agent 对话调用结果 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentInvokeDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** Agent 回复内容 */
    private String reply;

    /** Agent 唯一ID */
    private String agentUniqueId;

    /** Agent 名称 */
    private String agentName;

    /** 本次调用的追踪ID */
    private String traceId;
}
