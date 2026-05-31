package com.beukay.marketing.person.app.service;

import com.beukay.marketing.person.client.cmd.AgentInvokeCmd;
import com.beukay.marketing.person.client.dto.AgentInvokeDTO;
import com.beukay.marketing.person.domain.agentDefinition.gateway.AgentDefinitionGateway;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import com.beukay.marketing.person.domain.agentRegistry.gateway.AgentRegistryGateway;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistry;
import com.beukay.marketing.person.infrastructure.service.ArkAgentInvoker;
import com.beukay.marketing.person.infrastructure.service.HermesBeukayClawInvoker;
import com.beukay.marketing.person.infrastructure.service.QianchuanMcpInvoker;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.beukay.ai.common.exception.GenericBusinessException;
/**
 * Agent 对话调用 AppService
 * <p>
 * 流程：AgentRegistry → AgentDefinition → behaviorDsl 作 systemPrompt → 调用 Ark → 返回回复
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class AgentInvokeAppService {

    private final AgentRegistryGateway agentRegistryGateway;
    private final AgentDefinitionGateway agentDefinitionGateway;
    private final ArkAgentInvoker arkAgentInvoker;
    private final HermesBeukayClawInvoker hermesBeukayClawInvoker;
    private final QianchuanMcpInvoker qianchuanMcpInvoker;
    private final ObjectMapper objectMapper;

    public AgentInvokeDTO invoke(AgentInvokeCmd cmd) {
        // 1. 查注册表
        AgentRegistry registry = agentRegistryGateway.queryByAgentUniqueId(cmd.getAgentUniqueId());
        if (registry == null) {
            throw new GenericBusinessException("Agent 不存在：" + cmd.getAgentUniqueId());
        }
        if (!"ACTIVE".equals(registry.getStatus())) {
            throw new GenericBusinessException("Agent 当前不可用（状态=" + registry.getStatus() + "）");
        }

        // 2. 查定义（获取 behaviorDsl + modelConfig）
        String systemPrompt = "";
        String modelOverride = null;
        if (registry.getDefinitionId() != null) {
            AgentDefinition definition = agentDefinitionGateway.queryById(registry.getDefinitionId());
            if (definition != null) {
                systemPrompt = definition.getBehaviorDsl() != null ? definition.getBehaviorDsl() : "";
                modelOverride = parseModel(definition.getModelConfig());
            }
        }

        // 3. 构建历史
        List<Map<String, String>> history = toHistoryMaps(cmd.getHistory());

        // 4. 调用 Agent（BeukayClaw 走 Hermes，其余仍走 Ark）
        String traceId = "agent-trace-" + UUID.randomUUID();
        String reply;
        try {
            if ("beukay-claw".equals(cmd.getAgentUniqueId())) {
                reply = hermesBeukayClawInvoker.chat(history, cmd.getMessage());
            } else if (qianchuanMcpInvoker.supports(cmd.getAgentUniqueId())) {
                reply = qianchuanMcpInvoker.chat(cmd.getAgentUniqueId(), systemPrompt, history, cmd.getMessage(), modelOverride);
            } else {
                reply = arkAgentInvoker.chat(systemPrompt, history, cmd.getMessage(), modelOverride);
            }
        } catch (IOException | InterruptedException e) {
            log.error("Agent 调用失败: agentUniqueId={} traceId={} error={}", cmd.getAgentUniqueId(), traceId, e.getMessage());
            throw new GenericBusinessException("Agent 调用失败：" + e.getMessage() + ": " + e.getMessage());
        }

        if (reply == null || reply.isBlank()) {
            reply = "（Agent 暂时无法响应，请稍后重试）";
        }

        return AgentInvokeDTO.builder()
                .reply(reply)
                .agentUniqueId(cmd.getAgentUniqueId())
                .agentName(registry.getName())
                .traceId(traceId)
                .build();
    }

    private String parseModel(String modelConfig) {
        if (modelConfig == null || modelConfig.isBlank()) {
            return null;
        }
        try {
            JsonNode node = objectMapper.readTree(modelConfig);
            JsonNode model = node.get("model");
            return (model != null && model.isTextual()) ? model.asText() : null;
        } catch (Exception e) {
            log.warn("modelConfig 解析失败，使用默认模型: {}", e.getMessage());
            return null;
        }
    }

    private List<Map<String, String>> toHistoryMaps(List<AgentInvokeCmd.ConversationTurn> turns) {
        if (turns == null || turns.isEmpty()) {
            return new ArrayList<>();
        }
        List<Map<String, String>> result = new ArrayList<>();
        for (AgentInvokeCmd.ConversationTurn turn : turns) {
            if (turn.getRole() == null || turn.getContent() == null) {
                continue;
            }
            Map<String, String> m = new HashMap<>();
            m.put("role", turn.getRole());
            m.put("content", turn.getContent());
            result.add(m);
        }
        return result;
    }
}
