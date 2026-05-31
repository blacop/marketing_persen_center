package com.beukay.marketing.person.app.cutmatrix.compliance;

import com.beukay.marketing.person.app.cutmatrix.llm.LlmAdapter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 话术合规审核：LLM 扫描文案 → 标记风险句 + 修改建议。
 *
 * 风险类型：
 *   - 极限词（最、第一、唯一、绝对、100%、顶级、王牌）— 广告法第九条
 *   - 医疗暗示（疗效、治愈、根治、预防、治疗、药用）— 化妆品禁用语 / 食品禁用语
 *   - 虚假承诺（无效退款、效果立现、永久有效）
 *   - 比较广告（对比某品牌、超越某产品）
 *   - 数据无据（销量第一、复购最高，无来源）
 *   - 涉政敏感
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class CmComplianceService {

    private final LlmAdapter llm;

    private static final ObjectMapper JSON = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
            你是中国广告法合规审核专家，精通《广告法》《反不正当竞争法》《化妆品监督管理条例》《食品安全法》。
            任务：扫描营销文案，识别违规风险，给出可落地的修改建议。
            严格 JSON 输出，不输出 markdown 包裹。
            """;

    private static final String USER_PROMPT_TEMPLATE = """
            扫描以下营销文案的合规风险。

            场景：%s

            待审核文案（已按句切分，编号从 1 开始）：
            %s

            重点检查：
            1. 极限词：最、第一、唯一、绝对、100%%、顶级、王牌、最佳、最高、首选、独家、永久
            2. 医疗暗示：疗效、治愈、根治、预防、治疗、痊愈、康复、抗菌、消炎（化妆品/食品禁用）
            3. 虚假承诺：保证 X 天见效、无效退款、永久有效、立竿见影
            4. 比较广告：贬低同行、对比"某品牌"、超越竞品
            5. 数据无据：销量 X、复购第一（无来源年份地区）
            6. 涉政敏感：国家级、世界级、政府推荐、领导人代言
            7. 引人误解：限时/限量虚假、价格虚假

            严格 JSON：
            {
              "overallRisk": "high|medium|low|safe",
              "summary": "总体审核结论 1-2 句话",
              "risks": [
                {
                  "idx": 1,
                  "text": "原句",
                  "riskType": "极限词|医疗暗示|虚假承诺|比较广告|数据无据|涉政敏感|其他",
                  "level": "high|medium|low",
                  "violation": "命中的具体违规词或片段",
                  "suggestion": "修改后的合规版本（保持原意，去除违规）",
                  "regulation": "适用法规条款（可空）"
                }
              ]
            }

            如果完全合规，risks 为空数组，overallRisk 为 safe。
            只列有风险的句子，安全的不出现在 risks 里。
            """;

    public CmComplianceDtos.AuditResult audit(CmComplianceDtos.AuditCmd cmd) {
        long start = System.currentTimeMillis();
        if (cmd.getText() == null || cmd.getText().isBlank()) {
            return CmComplianceDtos.AuditResult.builder()
                    .status("FAILED").errMsg("text 为空").build();
        }
        String text = cmd.getText().trim();
        String category = cmd.getCategory() == null || cmd.getCategory().isBlank() ? "general" : cmd.getCategory();

        // 按句切分并编号（让 LLM 引用 idx）
        List<String> sentences = splitSentences(text);
        StringBuilder numbered = new StringBuilder();
        for (int i = 0; i < sentences.size(); i++) {
            numbered.append(i + 1).append(". ").append(sentences.get(i)).append("\n");
        }

        String userPrompt = String.format(USER_PROMPT_TEMPLATE, category, numbered.toString().trim());

        try {
            String resp = llm.chat(SYSTEM_PROMPT, userPrompt,
                    LlmAdapter.ChatOptions.builder()
                            .temperature(0.2).maxTokens(2500).responseFormat("json").build());
            CmComplianceDtos.AuditResult parsed = parseAuditJson(resp);
            parsed.setStatus("SUCCEEDED");
            parsed.setProvider(llm.getClass().getSimpleName());
            parsed.setElapsedMs(System.currentTimeMillis() - start);
            log.info("[Compliance/audit] {} chars / {} sentences → risk={}, {} risk items ({}ms)",
                    text.length(), sentences.size(), parsed.getOverallRisk(),
                    parsed.getRisks() == null ? 0 : parsed.getRisks().size(),
                    parsed.getElapsedMs());
            return parsed;
        } catch (Exception e) {
            log.error("[Compliance/audit] failed", e);
            return CmComplianceDtos.AuditResult.builder()
                    .status("FAILED")
                    .errMsg(e.getMessage())
                    .elapsedMs(System.currentTimeMillis() - start)
                    .build();
        }
    }

    /** 按 [。！？!?] 切句，过滤空 */
    private static List<String> splitSentences(String text) {
        List<String> out = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            cur.append(c);
            if ("。！？!?".indexOf(c) >= 0) {
                String s = cur.toString().trim();
                if (!s.isEmpty()) out.add(s);
                cur.setLength(0);
            }
        }
        String tail = cur.toString().trim();
        if (!tail.isEmpty()) out.add(tail);
        return out;
    }

    private static CmComplianceDtos.AuditResult parseAuditJson(String raw) {
        if (raw == null || raw.isBlank()) {
            return CmComplianceDtos.AuditResult.builder()
                    .overallRisk("safe").summary("LLM 返回为空").risks(new ArrayList<>()).build();
        }
        String s = raw.trim();
        if (s.startsWith("```")) {
            int nl = s.indexOf('\n');
            if (nl > 0) s = s.substring(nl + 1);
            if (s.endsWith("```")) s = s.substring(0, s.length() - 3).trim();
        }
        int lb = s.indexOf('{'), rb = s.lastIndexOf('}');
        if (lb >= 0 && rb > lb) s = s.substring(lb, rb + 1);

        try {
            JsonNode root = JSON.readTree(s);
            String overall = root.path("overallRisk").asText("safe");
            String summary = root.path("summary").asText("");

            List<CmComplianceDtos.AuditResult.RiskItem> risks = new ArrayList<>();
            JsonNode arr = root.path("risks");
            if (arr.isArray()) {
                for (JsonNode item : arr) {
                    risks.add(CmComplianceDtos.AuditResult.RiskItem.builder()
                            .idx(item.path("idx").asInt(0))
                            .text(item.path("text").asText(""))
                            .riskType(item.path("riskType").asText("其他"))
                            .level(item.path("level").asText("low"))
                            .violation(item.path("violation").asText(""))
                            .suggestion(item.path("suggestion").asText(""))
                            .regulation(item.path("regulation").asText(""))
                            .build());
                }
            }
            return CmComplianceDtos.AuditResult.builder()
                    .overallRisk(overall)
                    .summary(summary)
                    .risks(risks)
                    .build();
        } catch (Exception e) {
            log.warn("[Compliance/audit] JSON parse failed: {}; raw={}", e.getMessage(),
                    raw.length() > 300 ? raw.substring(0, 300) : raw);
            return CmComplianceDtos.AuditResult.builder()
                    .overallRisk("unknown")
                    .summary("LLM 输出解析失败，原始返回：" + (raw.length() > 200 ? raw.substring(0, 200) : raw))
                    .risks(new ArrayList<>())
                    .build();
        }
    }
}
