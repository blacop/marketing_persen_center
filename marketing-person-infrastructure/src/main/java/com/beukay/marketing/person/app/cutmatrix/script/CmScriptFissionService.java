package com.beukay.marketing.person.app.cutmatrix.script;

import com.beukay.marketing.person.app.cutmatrix.llm.LlmAdapter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 文案裂变：每分镜调 LLM 改写 N 次，组成 shots × versions 矩阵。
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class CmScriptFissionService {

    private final LlmAdapter llm;
    private final ProductInfoExtractor productExtractor;

    public CmScriptFissionDtos.FissionResult fission(CmScriptFissionDtos.FissionCmd cmd) {
        long start = System.currentTimeMillis();
        if (cmd.getShots() == null || cmd.getShots().isEmpty()) {
            return CmScriptFissionDtos.FissionResult.builder()
                    .status("FAILED").errMsg("shots 为空").build();
        }
        int count = cmd.getCount() == null ? 3 : Math.max(1, Math.min(20, cmd.getCount()));
        String style = cmd.getStyle() == null ? "default" : cmd.getStyle();

        LlmAdapter.RewriteOptions opts = LlmAdapter.RewriteOptions.builder()
                .style(style).temperature(0.8).maxTokens(400).build();

        List<List<String>> matrix = new ArrayList<>();
        int failedShots = 0;

        for (var shot : cmd.getShots()) {
            try {
                List<String> versions = llm.rewrite(shot.getName(), shot.getContent(), count, opts);
                // 保证返回长度等于 count（不足填原文，超出截断）
                if (versions.size() < count) {
                    List<String> padded = new ArrayList<>(versions);
                    while (padded.size() < count) padded.add(shot.getContent());
                    versions = padded;
                } else if (versions.size() > count) {
                    versions = versions.subList(0, count);
                }
                matrix.add(versions);
            } catch (Exception e) {
                log.warn("[ScriptFission] rewrite shot '{}' failed: {}", shot.getName(), e.getMessage());
                // 失败时全部填回原文
                List<String> fallback = new ArrayList<>(Collections.nCopies(count, shot.getContent()));
                matrix.add(fallback);
                failedShots++;
            }
        }

        long elapsed = System.currentTimeMillis() - start;
        String status = failedShots == 0 ? "SUCCEEDED" : (failedShots < cmd.getShots().size() ? "PARTIAL" : "FAILED");
        log.info("[ScriptFission] {} shots × {} versions ({}ms, status={}, failed={})",
                cmd.getShots().size(), count, elapsed, status, failedShots);

        return CmScriptFissionDtos.FissionResult.builder()
                .status(status).matrix(matrix)
                .provider(llm.getClass().getSimpleName())
                .elapsedMs(elapsed)
                .errMsg(failedShots > 0 ? failedShots + " 个分镜改写失败，已用原文兜底" : null)
                .build();
    }

    // ─── 智能拆解（reverse-engineered from autocut paraphrase/split） ────────

    private static final ObjectMapper JSON = new ObjectMapper();

    private static final String DECOMPOSE_SYSTEM_PROMPT = "你是文案分镜助手，专门把短视频口播文案切分成精细分镜。";

    private static final String DECOMPOSE_USER_PROMPT_TEMPLATE = """
            把以下口播文案切分成精细分镜，每分镜对应 1 个独立镜头。

            严格 JSON 输出（禁止 markdown code block 包裹）：
            {"shots":[{"name":"...","content":"..."},...]}

            切分规则：
            1. 每分镜对应原文的 1 个独立子句（按 `，` `。` `？` `！` 切）
            2. content 保持原文逐字不改，标点可保留可去除
            3. 单字 / 双字 / 短词独立成镜（如"抖音"、"看看看看"），不强行合并
            4. 长子句保留为单镜（13 字以上），不再二次切
            5. 严格按原文顺序，不调换、不省略

            name 命名规则（4-8 字）：
            - 格式：<对象><动作>
            - 对象词典：效果、妆效、功能、场景、人群、信息、特点、版本、产品、画面、动作
            - 动作词典：展示、评价、描述、说明、补充、验证、推荐、举例、建议、号召、提示
            - 示例：遮瑕效果展示 / 妆效描述 / 运动场景验证 / 行动号召 / 平台信息

            口播文案：
            %s
            """;

    private static final Pattern P_SENTENCE_SPLIT = Pattern.compile("(?<=[，。？！,.?!])");

    public CmScriptFissionDtos.DecomposeResult decompose(CmScriptFissionDtos.DecomposeCmd cmd) {
        long start = System.currentTimeMillis();
        if (cmd.getText() == null || cmd.getText().isBlank()) {
            return CmScriptFissionDtos.DecomposeResult.builder()
                    .status("FAILED").errMsg("text 为空").build();
        }
        String text = cmd.getText().trim();
        String userPrompt = String.format(DECOMPOSE_USER_PROMPT_TEMPLATE, text);

        // 1. 调 LLM
        try {
            String resp = llm.chat(DECOMPOSE_SYSTEM_PROMPT, userPrompt,
                    LlmAdapter.ChatOptions.builder().temperature(0.3).maxTokens(2000).responseFormat("json").build());
            List<CmScriptFissionDtos.DecomposeResult.Shot> shots = parseLlmShots(resp);
            if (!shots.isEmpty()) {
                long elapsed = System.currentTimeMillis() - start;
                log.info("[ScriptFission/decompose] {} chars → {} shots ({}ms)", text.length(), shots.size(), elapsed);
                return CmScriptFissionDtos.DecomposeResult.builder()
                        .status("SUCCEEDED").shots(shots)
                        .provider(llm.getClass().getSimpleName())
                        .fallbackUsed(false)
                        .elapsedMs(elapsed)
                        .build();
            }
            log.warn("[ScriptFission/decompose] LLM 返回 0 个 shot，走正则兜底");
        } catch (Exception e) {
            log.warn("[ScriptFission/decompose] LLM call failed: {}, fallback regex", e.getMessage());
        }

        // 2. 兜底：正则切句
        List<CmScriptFissionDtos.DecomposeResult.Shot> fallback = regexSplit(text);
        long elapsed = System.currentTimeMillis() - start;
        return CmScriptFissionDtos.DecomposeResult.builder()
                .status("PARTIAL")
                .shots(fallback)
                .provider("regex-fallback")
                .fallbackUsed(true)
                .elapsedMs(elapsed)
                .errMsg("LLM 调用失败，已使用正则切句兜底")
                .build();
    }

    /** LLM JSON 结果解析（容错处理 markdown 包裹和 JSON 之外的散文） */
    private static List<CmScriptFissionDtos.DecomposeResult.Shot> parseLlmShots(String raw) {
        List<CmScriptFissionDtos.DecomposeResult.Shot> out = new ArrayList<>();
        if (raw == null || raw.isBlank()) return out;
        String s = raw.trim();
        // 去 markdown code fence
        if (s.startsWith("```")) {
            int nl = s.indexOf('\n');
            if (nl > 0) s = s.substring(nl + 1);
            if (s.endsWith("```")) s = s.substring(0, s.length() - 3).trim();
        }
        // 截取首个 { 到末尾 }（容忍模型加散文前缀）
        int lb = s.indexOf('{');
        int rb = s.lastIndexOf('}');
        if (lb >= 0 && rb > lb) s = s.substring(lb, rb + 1);

        try {
            JsonNode root = JSON.readTree(s);
            JsonNode shots = root.path("shots");
            if (shots.isArray()) {
                for (JsonNode item : shots) {
                    String name = item.path("name").asText("").trim();
                    String content = item.path("content").asText("").trim();
                    if (content.isEmpty()) continue;
                    if (name.isEmpty()) name = "分镜" + (out.size() + 1);
                    out.add(CmScriptFissionDtos.DecomposeResult.Shot.builder()
                            .name(name).content(content).build());
                }
            }
        } catch (Exception e) {
            log.debug("[ScriptFission/decompose] JSON parse failed: {}", e.getMessage());
        }
        return out;
    }

    // ─── AI 文案调整（脚本迁移 + 加码） ──────────────────────────────────────

    public CmScriptFissionDtos.AdjustResult adjust(CmScriptFissionDtos.AdjustCmd cmd) {
        long t0 = System.currentTimeMillis();
        if (cmd.getShots() == null || cmd.getShots().isEmpty()) {
            return CmScriptFissionDtos.AdjustResult.builder()
                    .status("FAILED").errMsg("shots 为空").build();
        }

        // 1. 抓产品页（可选）
        String productSummary = "";
        if (cmd.getProductUrl() != null && !cmd.getProductUrl().isBlank()) {
            productSummary = productExtractor.extract(cmd.getProductUrl());
        }

        String userInstruction = cmd.getInstruction() == null ? "" : cmd.getInstruction().trim();
        if (productSummary.isBlank() && userInstruction.isBlank()) {
            return CmScriptFissionDtos.AdjustResult.builder()
                    .status("FAILED").errMsg("productUrl 和 instruction 至少需要一个").build();
        }

        // 2. 决定路径：有 matrix → transform；无 matrix → 走 fission 路径生成
        List<List<String>> resultMatrix;
        if (cmd.getMatrix() != null && !cmd.getMatrix().isEmpty()
                && cmd.getMatrix().size() == cmd.getShots().size()) {
            resultMatrix = transformMatrix(cmd, productSummary, userInstruction);
        } else {
            resultMatrix = adjustViaFission(cmd, productSummary, userInstruction);
        }

        long elapsed = System.currentTimeMillis() - t0;
        return CmScriptFissionDtos.AdjustResult.builder()
                .status("SUCCEEDED")
                .matrix(resultMatrix)
                .productSummary(productSummary)
                .provider(llm.getClass().getSimpleName())
                .elapsedMs(elapsed)
                .build();
    }

    /** 已有矩阵 → 整体 transform（保留行列结构） */
    private List<List<String>> transformMatrix(CmScriptFissionDtos.AdjustCmd cmd,
                                               String productSummary, String userInstruction) {
        // 把矩阵展开成可解析文本
        StringBuilder matrixText = new StringBuilder();
        int rows = cmd.getMatrix().size();
        int cols = cmd.getMatrix().get(0).size();
        for (int i = 0; i < rows; i++) {
            matrixText.append("\n## 分镜 ").append(i + 1)
                    .append("（").append(cmd.getShots().get(i).getName()).append("）\n");
            List<String> row = cmd.getMatrix().get(i);
            for (int j = 0; j < row.size(); j++) {
                matrixText.append("v").append(j + 1).append(": ").append(row.get(j)).append("\n");
            }
        }

        String sys = "你是文案智能调整大师。基于新产品信息和用户指令，把已有的文案矩阵改造成新版本，" +
                "保持原始的行列结构和卖点节奏不变，只做指令要求的调整（如品牌替换、措辞增强、卖点切换等）。";

        String user = """
                【任务】
                把以下文案矩阵按用户指令做整体调整，输出与原矩阵行列数完全一致的新矩阵。

                【新产品信息（如有）】
                %s

                【用户调整指令】
                %s

                【原文案矩阵】
                %s

                【调整规则】
                1. **保持矩阵结构**：%d 行 × %d 列，shot 顺序和数量都不能变
                2. **执行用户指令**：品牌替换 / 卖点切换 / 措辞增强 / 风格转换 等
                3. **保留原文风格**：抖音网感、口语化、夸张比喻、感叹反问等修辞特征要继承
                4. **整合产品信息**：若提供了新产品信息，用新品牌名 / 新卖点替换原有内容
                5. **每镜内 N 个版本风格仍要不同**：v1 / v2 / v3 各有侧重

                【输出】严格 JSON（禁止 markdown code block 包裹）：
                {"matrix":[["v1","v2","v3"], ["v1","v2","v3"], ...]}

                matrix 必须为 %d 行，每行 %d 列。
                """.formatted(
                        productSummary.isBlank() ? "（无）" : productSummary,
                        userInstruction.isBlank() ? "（无）" : userInstruction,
                        matrixText.toString(),
                        rows, cols, rows, cols);

        try {
            String resp = llm.chat(sys, user, LlmAdapter.ChatOptions.builder()
                    .temperature(0.7).maxTokens(3000).responseFormat("json").build());
            List<List<String>> parsed = parseMatrixJson(resp, rows, cols);
            if (!parsed.isEmpty()) return parsed;
            log.warn("[ScriptFission/adjust] LLM matrix parse empty, return original");
        } catch (Exception e) {
            log.warn("[ScriptFission/adjust] LLM transform failed: {}", e.getMessage());
        }
        // 兜底：返回原矩阵
        return cmd.getMatrix();
    }

    /** 无 matrix → 走 fission，但 prompt 注入产品信息和指令作为 style 提示 */
    private List<List<String>> adjustViaFission(CmScriptFissionDtos.AdjustCmd cmd,
                                                String productSummary, String userInstruction) {
        // 默认每镜出 3 版
        int count = 3;
        List<List<String>> out = new ArrayList<>();
        for (var shot : cmd.getShots()) {
            try {
                String enriched = (productSummary.isBlank() ? "" : "新产品信息：" + productSummary + "\n\n")
                        + (userInstruction.isBlank() ? "" : "调整指令：" + userInstruction + "\n\n")
                        + "原文：" + shot.getContent();
                List<String> versions = llm.rewrite(shot.getName(), enriched, count,
                        LlmAdapter.RewriteOptions.builder().style("default").temperature(0.85).build());
                if (versions.size() < count) {
                    while (versions.size() < count) versions.add(shot.getContent());
                } else if (versions.size() > count) {
                    versions = versions.subList(0, count);
                }
                out.add(versions);
            } catch (Exception e) {
                log.warn("[ScriptFission/adjust] shot {} failed: {}", shot.getName(), e.getMessage());
                out.add(new ArrayList<>(Collections.nCopies(count, shot.getContent())));
            }
        }
        return out;
    }

    /** 容错解析矩阵 JSON */
    private static List<List<String>> parseMatrixJson(String raw, int expectRows, int expectCols) {
        List<List<String>> out = new ArrayList<>();
        if (raw == null || raw.isBlank()) return out;
        String s = raw.trim();
        if (s.startsWith("```")) {
            int nl = s.indexOf('\n');
            if (nl > 0) s = s.substring(nl + 1);
            if (s.endsWith("```")) s = s.substring(0, s.length() - 3).trim();
        }
        int lb = s.indexOf('{');
        int rb = s.lastIndexOf('}');
        if (lb >= 0 && rb > lb) s = s.substring(lb, rb + 1);

        try {
            JsonNode root = JSON.readTree(s);
            JsonNode m = root.path("matrix");
            if (m.isArray()) {
                for (JsonNode row : m) {
                    List<String> cells = new ArrayList<>();
                    if (row.isArray()) {
                        for (JsonNode cell : row) cells.add(cell.asText("").trim());
                    }
                    // 列数不齐：补空 / 截断
                    while (cells.size() < expectCols) cells.add("");
                    if (cells.size() > expectCols) cells = cells.subList(0, expectCols);
                    out.add(cells);
                }
            }
        } catch (Exception e) {
            log.debug("[adjust] matrix JSON parse failed: {}", e.getMessage());
        }
        // 行数不齐：截断或留原样（让上层用原矩阵兜底）
        if (out.size() > expectRows) out = out.subList(0, expectRows);
        return out;
    }

    /** 兜底正则切句（与前端 decomposeText 等价） */
    private static List<CmScriptFissionDtos.DecomposeResult.Shot> regexSplit(String text) {
        List<CmScriptFissionDtos.DecomposeResult.Shot> out = new ArrayList<>();
        Matcher m = P_SENTENCE_SPLIT.matcher(text);
        int last = 0; int idx = 0;
        while (m.find()) {
            String chunk = text.substring(last, m.end()).trim();
            if (!chunk.isEmpty()) {
                idx++;
                out.add(CmScriptFissionDtos.DecomposeResult.Shot.builder()
                        .name("分镜" + idx).content(chunk).build());
            }
            last = m.end();
        }
        if (last < text.length()) {
            String tail = text.substring(last).trim();
            if (!tail.isEmpty()) {
                idx++;
                out.add(CmScriptFissionDtos.DecomposeResult.Shot.builder()
                        .name("分镜" + idx).content(tail).build());
            }
        }
        return out;
    }
}
