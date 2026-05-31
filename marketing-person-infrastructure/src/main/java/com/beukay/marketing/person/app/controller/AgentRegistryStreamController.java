package com.beukay.marketing.person.app.controller;

import com.beukay.marketing.person.client.cmd.AgentInvokeCmd;
import com.beukay.marketing.person.domain.agentDefinition.gateway.AgentDefinitionGateway;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import com.beukay.marketing.person.domain.agentRegistry.gateway.AgentRegistryGateway;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistry;
import com.beukay.marketing.person.infrastructure.service.ArkAgentInvoker;
import com.beukay.marketing.person.infrastructure.service.HermesBeukayClawInvoker;
import com.beukay.marketing.person.infrastructure.service.QianchuanMcpInvoker;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * AgentRegistry 流式调用 Controller（SSE）。
 * <p>
 * 不走 Feign 接口，专供浏览器 fetch streaming 使用。
 * BeukayClaw 使用 {@code /agentRegistry/invokeStream}，逐行推送 Hermes 输出；
 * 其余 Agent 作非流式兜底（单条 data 事件）。
 *
 * <p>SSE 事件格式：
 * <pre>
 *   data: &lt;line&gt;\n\n       ← 内容行
 *   event: done\ndata: \n\n ← 结束标志
 *   event: error\ndata: &lt;msg&gt;\n\n ← 错误
 * </pre>
 */
@RestController
@RequiredArgsConstructor
@Log4j2
public class AgentRegistryStreamController {

    private static final long SSE_TIMEOUT_MS = 300_000L;
    private static final long HEARTBEAT_INTERVAL_SEC = 10L;

    /** 共享心跳调度器，单线程足够（每个 emitter 仅占用一个调度槽）。 */
    private static final ScheduledExecutorService HEARTBEAT_SCHEDULER =
            Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "sse-heartbeat");
                t.setDaemon(true);
                return t;
            });

    private final AgentRegistryGateway agentRegistryGateway;
    private final AgentDefinitionGateway agentDefinitionGateway;
    private final HermesBeukayClawInvoker hermesBeukayClawInvoker;
    private final QianchuanMcpInvoker qianchuanMcpInvoker;
    private final ArkAgentInvoker arkAgentInvoker;
    private final ObjectMapper objectMapper;

    @PostMapping(value = "/agentRegistry/invokeStream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter invokeAgentStream(@RequestBody @Valid AgentInvokeCmd cmd) {
        AgentRegistry registry = agentRegistryGateway.queryByAgentUniqueId(cmd.getAgentUniqueId());
        if (registry == null) {
            SseEmitter err = new SseEmitter(0L);
            err.completeWithError(new IllegalArgumentException("Agent 不存在：" + cmd.getAgentUniqueId()));
            return err;
        }
        if (!"ACTIVE".equals(registry.getStatus())) {
            SseEmitter err = new SseEmitter(0L);
            err.completeWithError(new IllegalStateException("Agent 当前不可用（状态=" + registry.getStatus() + "）"));
            return err;
        }

        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        List<Map<String, String>> history = toHistoryMaps(cmd.getHistory());

        // 立即推送一次初始 ping，确保 vite 代理 / 浏览器尽快感知连接已建立
        try {
            emitter.send(SseEmitter.event().comment("connected"));
        } catch (IOException ignored) {
            // 客户端已断开，后续逻辑会在虚拟线程中报错
        }

        // 心跳：每 10s 推送一次注释行，防止代理空闲断开
        AtomicBoolean alive = new AtomicBoolean(true);
        ScheduledFuture<?> heartbeat = HEARTBEAT_SCHEDULER.scheduleAtFixedRate(() -> {
            if (!alive.get()) {
                return;
            }
            try {
                emitter.send(SseEmitter.event().comment("hb"));
            } catch (Exception e) {
                alive.set(false);
            }
        }, HEARTBEAT_INTERVAL_SEC, HEARTBEAT_INTERVAL_SEC, TimeUnit.SECONDS);

        Runnable cancelHeartbeat = () -> {
            alive.set(false);
            heartbeat.cancel(false);
        };
        emitter.onCompletion(cancelHeartbeat);
        emitter.onTimeout(cancelHeartbeat);
        emitter.onError(t -> cancelHeartbeat.run());

        // Java 21 虚拟线程，不阻塞 NIO worker 线程
        Thread.ofVirtual()
                .name("hermes-sse-" + cmd.getAgentUniqueId())
                .start(() -> {
                    try {
                        if ("beukay-claw".equals(cmd.getAgentUniqueId())) {
                            hermesBeukayClawInvoker.chatStream(history, cmd.getMessage(), line -> {
                                try {
                                    emitter.send(SseEmitter.event().data(line));
                                } catch (IOException e) {
                                    throw new RuntimeException("SSE send failed", e);
                                }
                            });
                        } else {
                            // 非 BeukayClaw：同步调用后作单条 SSE 推送
                            String systemPrompt = resolveSystemPrompt(registry);
                            String modelOverride = resolveModelOverride(registry);
                            String reply;
                            if (qianchuanMcpInvoker.supports(cmd.getAgentUniqueId())) {
                                reply = qianchuanMcpInvoker.chat(
                                        cmd.getAgentUniqueId(), systemPrompt, history,
                                        cmd.getMessage(), modelOverride);
                            } else {
                                reply = arkAgentInvoker.chat(systemPrompt, history, cmd.getMessage(), modelOverride);
                            }
                            emitter.send(SseEmitter.event().data(reply));
                        }
                        emitter.send(SseEmitter.event().name("done").data(""));
                        emitter.complete();
                    } catch (Exception e) {
                        log.error("SSE stream error: agentUniqueId={} error={}", cmd.getAgentUniqueId(), e.getMessage());
                        try {
                            emitter.send(SseEmitter.event().name("error").data(e.getMessage()));
                        } catch (IOException ignored) {
                        }
                        emitter.completeWithError(e);
                    }
                });

        return emitter;
    }

    private String resolveSystemPrompt(AgentRegistry registry) {
        if (registry.getDefinitionId() == null) {
            return "";
        }
        AgentDefinition def = agentDefinitionGateway.queryById(registry.getDefinitionId());
        return (def != null && def.getBehaviorDsl() != null) ? def.getBehaviorDsl() : "";
    }

    private String resolveModelOverride(AgentRegistry registry) {
        if (registry.getDefinitionId() == null) {
            return null;
        }
        AgentDefinition def = agentDefinitionGateway.queryById(registry.getDefinitionId());
        if (def == null || def.getModelConfig() == null || def.getModelConfig().isBlank()) {
            return null;
        }
        try {
            JsonNode node = objectMapper.readTree(def.getModelConfig());
            JsonNode model = node.get("model");
            return (model != null && model.isTextual()) ? model.asText() : null;
        } catch (Exception e) {
            log.warn("modelConfig 解析失败: {}", e.getMessage());
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
