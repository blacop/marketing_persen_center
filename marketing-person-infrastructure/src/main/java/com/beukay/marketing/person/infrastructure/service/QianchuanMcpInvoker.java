package com.beukay.marketing.person.infrastructure.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * 巨量千川 MCP 调用器
 * <p>
 * 千川投放（qianchuan-delivery-v1）与千川数据（qianchuan-data-v1）两个 Agent 共用本通路：
 * 1. 读取 AgentDefinition.behaviorDsl 作为能力定义（其中已声明工具白名单与工作流）
 * 2. 注入 MCP 接入信息（server / base_url / advertiser_id）
 * 3. 先调用本地 mock MCP runtime，跑通 Agent -> MCP -> mock API -> reply 的完整链路
 * 4. 后续接真实巨量千川时，只替换 mock runtime / API client，不改 Agent 路由契约
 */
@Component
@Log4j2
public class QianchuanMcpInvoker {

    static final String DELIVERY_AGENT_ID = "qianchuan-delivery-v1";
    static final String DATA_AGENT_ID = "qianchuan-data-v1";

    private final ObjectMapper objectMapper;
    private final QianchuanMockMcpRuntime mockMcpRuntime;

    private final boolean enabled;
    private final String baseUrl;
    private final String serverName;
    private final String accessToken;
    private final String advertiserId;

    public QianchuanMcpInvoker(
            ObjectMapper objectMapper,
            QianchuanMockMcpRuntime mockMcpRuntime,
            @Value("${qianchuan.mcp.enabled:true}") boolean enabled,
            @Value("${qianchuan.mcp.base-url:mock://qianchuan-api}") String baseUrl,
            @Value("${qianchuan.mcp.server-name:qianchuan-mock-mcp-server}") String serverName,
            @Value("${qianchuan.mcp.access-token:}") String accessToken,
            @Value("${qianchuan.mcp.advertiser-id:}") String advertiserId) {
        this.objectMapper = objectMapper;
        this.mockMcpRuntime = mockMcpRuntime;
        this.enabled = enabled;
        this.baseUrl = baseUrl;
        this.serverName = serverName;
        this.accessToken = accessToken;
        this.advertiserId = advertiserId;
    }

    public boolean supports(String agentUniqueId) {
        return DELIVERY_AGENT_ID.equals(agentUniqueId) || DATA_AGENT_ID.equals(agentUniqueId);
    }

    public String chat(String agentUniqueId,
                       String systemPrompt,
                       List<Map<String, String>> history,
                       String userMessage,
                       String modelOverride) throws IOException, InterruptedException {
        if (!enabled) {
            throw new IllegalStateException("千川 MCP 通道已禁用（qianchuan.mcp.enabled=false）");
        }

        String enrichedPrompt = enrichSystemPrompt(agentUniqueId, systemPrompt);
        log.info("千川 mock MCP 调用: agent={} server={} baseUrl={} hasToken={} hasAdvertiserId={} promptLength={}",
                agentUniqueId, serverName, baseUrl, !isBlank(accessToken), !isBlank(advertiserId), enrichedPrompt.length());
        QianchuanMockMcpRuntime.QianchuanMcpContext context =
                new QianchuanMockMcpRuntime.QianchuanMcpContext(serverName, baseUrl, advertiserId, !isBlank(accessToken));
        return mockMcpRuntime.execute(agentUniqueId, userMessage, context);
    }

    String enrichSystemPrompt(String agentUniqueId, String systemPrompt) {
        StringBuilder sb = new StringBuilder();
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            sb.append(systemPrompt).append("\n\n");
        }
        sb.append("## MCP 运行环境\n")
                .append("- mcp_server: ").append(serverName).append('\n')
                .append("- base_url: ").append(baseUrl).append('\n')
                .append("- access_token: ").append(maskToken(accessToken)).append('\n')
                .append("- advertiser_id: ").append(isBlank(advertiserId) ? "未配置" : advertiserId).append('\n');
        if (isBlank(accessToken) || isBlank(advertiserId)) {
            sb.append("\n注意：access_token 或 advertiser_id 缺失时，必须先向用户追问，再尝试调用任何写操作工具。\n");
        }
        return sb.toString();
    }

    /**
     * 解析 modelConfig JSON，与 AgentInvokeAppService 复用同一约定。
     */
    public String parseModel(String modelConfig) {
        if (isBlank(modelConfig)) {
            return null;
        }
        try {
            JsonNode node = objectMapper.readTree(modelConfig);
            JsonNode model = node.get("model");
            return (model != null && model.isTextual()) ? model.asText() : null;
        } catch (Exception e) {
            log.warn("modelConfig 解析失败: {}", e.getMessage());
            return null;
        }
    }

    private String maskToken(String token) {
        if (isBlank(token)) {
            return "未配置";
        }
        if (token.length() <= 6) {
            return "***";
        }
        return token.substring(0, 4) + "***" + token.substring(token.length() - 2);
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
