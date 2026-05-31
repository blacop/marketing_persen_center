package com.beukay.marketing.person.infrastructure.service;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 基于 Hermes CLI 的 Beukay agent 调用器。
 * <p>
 * 作用：
 * 1. 在运行前确保 Beukay agent 对应的 Hermes skill 已同步到 ~/.hermes/skills/beukay
 * 2. 通过 hermes chat 单轮调用，让 Hermes 在对话中自动决定是否使用本地工具/脚本
 * 3. 把 Hermes quiet 输出中的 session_id 尾行剥离，仅返回最终回复正文
 */
@Component
@Log4j2
public class HermesBeukayClawInvoker {

    static final String SKILL_NAME = "beukay-claw-router";
    private static final String SKILL_FILE = "SKILL.md";
    private static final int MAX_HISTORY_TURNS = 8;

    private final String hermesCommand;
    private final Path workspaceDir;
    private final Path runtimeSkillNamespaceDir;
    private final Duration timeout;

    public HermesBeukayClawInvoker(
            @Value("${beukay.hermes.command:hermes}") String hermesCommand,
            @Value("${beukay.workspace.dir:}") String workspaceDir,
            @Value("${beukay.hermes.runtime.skills.dir:}") String runtimeSkillsDir,
            @Value("${beukay.hermes.beukay-claw.timeout-seconds:120}") long timeoutSeconds) {
        this.hermesCommand = blankToDefault(hermesCommand, "hermes");
        this.workspaceDir = Path.of(blankToDefault(workspaceDir, System.getProperty("user.dir"))).toAbsolutePath().normalize();
        this.runtimeSkillNamespaceDir = Path.of(blankToDefault(runtimeSkillsDir,
                Path.of(System.getProperty("user.home"), ".hermes", "skills", "beukay").toString()))
                .toAbsolutePath().normalize();
        this.timeout = Duration.ofSeconds(Math.max(timeoutSeconds, 10));
    }

    public String chat(List<Map<String, String>> history, String userMessage) throws IOException, InterruptedException {
        ensureSkillInstalled();

        String query = buildQuery(history, userMessage);
        List<String> command = List.of(
                hermesCommand,
                "chat",
                "-Q",
                "--yolo",
                "--accept-hooks",
                "--source", "tool",
                "--max-turns", "16",
                "-s", SKILL_NAME,
                "-q", query
        );

        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(workspaceDir.toFile());
        builder.redirectErrorStream(true);

        log.info("调用 Hermes Beukay agent: workspace={} skill={} command={}", workspaceDir, SKILL_NAME, hermesCommand);
        Process process = builder.start();
        String output = readAll(process);

        boolean finished = process.waitFor(timeout.toSeconds(), TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new IllegalStateException("Hermes 调用超时，timeout=" + timeout.toSeconds() + "s");
        }
        if (process.exitValue() != 0) {
            throw new IllegalStateException("Hermes 调用失败，exitCode=" + process.exitValue() + "，output=" + sanitize(output));
        }

        String reply = stripSessionFooter(output);
        if (reply.isBlank()) {
            throw new IllegalStateException("Hermes 未返回有效内容");
        }
        return reply;
    }

    /**
     * 流式调用：每读取一行 stdout 就通过 lineConsumer 推送，实现 SSE 逐行输出。
     * <p>
     * 与 {@link #chat} 的区别：不等待全部输出后再返回，而是边读边推，适合前端流式渲染。
     */
    public void chatStream(List<Map<String, String>> history, String userMessage,
                           java.util.function.Consumer<String> lineConsumer) throws IOException, InterruptedException {
        ensureSkillInstalled();

        String query = buildQuery(history, userMessage);
        List<String> command = List.of(
                hermesCommand,
                "chat",
                "-Q",
                "--yolo",
                "--accept-hooks",
                "--source", "tool",
                "--max-turns", "16",
                "-s", SKILL_NAME,
                "-q", query
        );

        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(workspaceDir.toFile());
        builder.redirectErrorStream(true);

        log.info("调用 Hermes Beukay agent (stream): workspace={} skill={}", workspaceDir, SKILL_NAME);
        Process process = builder.start();

        // 收集最后几行输出以便在失败时报告诊断信息
        List<String> lastLines = new java.util.ArrayDeque<String>() {{
        }}.stream().collect(Collectors.toList());
        // 使用固定大小的循环缓冲（最近 10 行）
        java.util.Deque<String> recentLines = new java.util.ArrayDeque<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (recentLines.size() >= 10) recentLines.pollFirst();
                recentLines.addLast(trimmed);
                if (!trimmed.isEmpty() && !trimmed.startsWith("session_id:")) {
                    lineConsumer.accept(trimmed);
                }
            }
        }

        boolean finished = process.waitFor(timeout.toSeconds(), TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new IllegalStateException("Hermes 调用超时，timeout=" + timeout.toSeconds() + "s");
        }
        if (process.exitValue() != 0) {
            String tail = String.join(" | ", recentLines);
            String tail80 = tail.length() > 200 ? tail.substring(0, 200) + "..." : tail;
            throw new IllegalStateException(
                    "Hermes 调用失败 (stream)，exitCode=" + process.exitValue()
                    + (tail80.isBlank() ? "" : "，tail=" + tail80));
        }
    }

    void ensureSkillInstalled() throws IOException {
        Path sourceSkillFile = resolveSourceSkillFile();
        if (!Files.exists(sourceSkillFile)) {
            throw new IllegalStateException("Beukay agent Hermes skill 不存在: " + sourceSkillFile);
        }

        Path targetSkillDir = runtimeSkillNamespaceDir.resolve(SKILL_NAME);
        Files.createDirectories(targetSkillDir);
        Files.copy(sourceSkillFile, targetSkillDir.resolve(SKILL_FILE), StandardCopyOption.REPLACE_EXISTING);
    }

    Path resolveSourceSkillFile() {
        Path relativeSkillPath = Path.of("hermes", "skills", SKILL_NAME, SKILL_FILE);
        Path current = workspaceDir;
        while (current != null) {
            Path candidate = current.resolve(relativeSkillPath);
            if (Files.exists(candidate)) {
                return candidate;
            }
            current = current.getParent();
        }
        return workspaceDir.resolve(relativeSkillPath);
    }

    static String buildQuery(List<Map<String, String>> history, String userMessage) {
        StringBuilder builder = new StringBuilder();
        builder.append("你现在以 Beukay agent 身份响应用户。\n")
                .append("如用户要求脚本蓝图、结构卡、视频装配或视频拆解，且参数足够，你必须先使用已加载的 Hermes skill 与本地工具脚本调用对应 Agent。\n")
                .append("禁止在未调用工具的情况下伪造结构化结果。\n")
                .append("如果缺少调用某个 Agent 所需的关键参数，请先追问，不要臆造。\n")
                .append("请始终使用中文回复。\n\n");

        if (history != null && !history.isEmpty()) {
            builder.append("最近对话历史：\n");
            int start = Math.max(0, history.size() - MAX_HISTORY_TURNS * 2);
            for (int i = start; i < history.size(); i++) {
                Map<String, String> turn = history.get(i);
                String role = turn.getOrDefault("role", "user");
                String content = turn.getOrDefault("content", "");
                if (content.isBlank()) {
                    continue;
                }
                builder.append(role).append(": ").append(content).append("\n");
            }
            builder.append("\n");
        }

        builder.append("当前用户消息：\n")
                .append(userMessage == null ? "" : userMessage.trim())
                .append("\n");
        return builder.toString();
    }

    static String stripSessionFooter(String output) {
        if (output == null || output.isBlank()) {
            return "";
        }
        List<String> lines = output.lines()
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .filter(line -> !line.startsWith("session_id:"))
                .collect(Collectors.toCollection(ArrayList::new));
        return String.join("\n", lines).trim();
    }

    private String readAll(Process process) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }

    private String sanitize(String output) {
        String text = stripSessionFooter(output);
        String compact = text.replaceAll("[\\r\\n]+", " ").trim();
        return compact.length() > 300 ? compact.substring(0, 300) + "..." : compact;
    }

    private static String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
