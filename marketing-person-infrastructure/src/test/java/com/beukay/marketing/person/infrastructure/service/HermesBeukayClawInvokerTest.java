package com.beukay.marketing.person.infrastructure.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HermesBeukayClawInvokerTest {

    @TempDir
    Path tempDir;

    @Test
    void shouldInstallSkillAndStripSessionFooter() throws Exception {
        Path workspaceDir = tempDir.resolve("workspace");
        Files.createDirectories(workspaceDir.resolve("hermes/skills/beukay-claw-router"));
        Files.writeString(workspaceDir.resolve("hermes/skills/beukay-claw-router/SKILL.md"), "# skill\n", StandardCharsets.UTF_8);

        Path runtimeSkillsDir = tempDir.resolve("runtime-skills");
        Path captureFile = tempDir.resolve("hermes-args.txt");
        Path fakeHermes = tempDir.resolve("fake-hermes.sh");
        Files.writeString(fakeHermes,
                "#!/bin/bash\n"
                        + "printf '%s\n' \"$@\" > '" + captureFile + "'\n"
                        + "printf 'ROUTED_OK\\n\\nsession_id: test-session\\n'\n",
                StandardCharsets.UTF_8);
        fakeHermes.toFile().setExecutable(true);

        HermesBeukayClawInvoker invoker = new HermesBeukayClawInvoker(
                fakeHermes.toString(),
                workspaceDir.toString(),
                runtimeSkillsDir.toString(),
                30
        );

        String reply = invoker.chat(List.of(Map.of("role", "user", "content", "上一轮问题")), "这轮消息");

        assertEquals("ROUTED_OK", reply);
        assertTrue(Files.exists(runtimeSkillsDir.resolve("beukay-claw-router/SKILL.md")));
        String args = Files.readString(captureFile, StandardCharsets.UTF_8);
        assertTrue(args.contains("chat"));
        assertTrue(args.contains("-s"));
        assertTrue(args.contains("beukay-claw-router"));
    }

    @Test
    void shouldFindSkillFromRepositoryRootWhenStartedInModuleDirectory() throws Exception {
        Path repoRoot = tempDir.resolve("repo-root");
        Path moduleDir = repoRoot.resolve("marketing-person-infrastructure");
        Files.createDirectories(repoRoot.resolve("hermes/skills/beukay-claw-router"));
        Files.createDirectories(moduleDir);
        Files.writeString(repoRoot.resolve("hermes/skills/beukay-claw-router/SKILL.md"), "# repo skill\n", StandardCharsets.UTF_8);

        Path runtimeSkillsDir = tempDir.resolve("runtime-skills");
        Path fakeHermes = tempDir.resolve("fake-hermes.sh");
        Files.writeString(fakeHermes,
                "#!/bin/bash\n"
                        + "printf 'ROUTED_OK\\n'\n",
                StandardCharsets.UTF_8);
        fakeHermes.toFile().setExecutable(true);

        HermesBeukayClawInvoker invoker = new HermesBeukayClawInvoker(
                fakeHermes.toString(),
                moduleDir.toString(),
                runtimeSkillsDir.toString(),
                30
        );

        String reply = invoker.chat(List.of(), "请只回复 OK");

        assertEquals("ROUTED_OK", reply);
        assertTrue(Files.exists(runtimeSkillsDir.resolve("beukay-claw-router/SKILL.md")));
    }

    @Test
    void shouldStripSessionFooter() {
        String raw = "最终回复\n\nsession_id: abc123\n";
        assertEquals("最终回复", HermesBeukayClawInvoker.stripSessionFooter(raw));
    }

    @Test
    void shouldStripSessionHeader() {
        String raw = "session_id: abc123\n最终回复\n";
        assertEquals("最终回复", HermesBeukayClawInvoker.stripSessionFooter(raw));
    }

    @Test
    void shouldBuildQueryWithHistory() {
        String query = HermesBeukayClawInvoker.buildQuery(
                List.of(
                        Map.of("role", "user", "content", "你好"),
                        Map.of("role", "assistant", "content", "您好")
                ),
                "请生成脚本蓝图"
        );
        assertTrue(query.contains("最近对话历史"));
        assertTrue(query.contains("user: 你好"));
        assertTrue(query.contains("assistant: 您好"));
        assertTrue(query.contains("当前用户消息"));
    }
}
