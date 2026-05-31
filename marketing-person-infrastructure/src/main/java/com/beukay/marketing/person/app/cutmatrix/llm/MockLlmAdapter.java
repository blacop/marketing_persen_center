package com.beukay.marketing.person.app.cutmatrix.llm;

import lombok.extern.log4j.Log4j2;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Mock LLM：基于规则的文本变形（前后缀 + 同义词替换 + 语气词插入）。
 * 默认启用：cm.llm.provider=mock（也作为兜底）。
 */
@Service
@Log4j2
@ConditionalOnProperty(value = "cm.llm.provider", havingValue = "mock", matchIfMissing = true)
public class MockLlmAdapter implements LlmAdapter {

    private static final String[] PREFIXES = {
            "", "说真的，", "不得不说，", "亲测有效，", "用过才知道，",
            "真的绝了，", "姐妹们听我说，", "敲重点！", "实测分享，"
    };
    private static final String[] SUFFIXES = {
            "", "超好用！", "强烈推荐。", "真的很不错。", "一用就爱上。",
            "太绝了！", "回购无数次。", "学姐保姆级安利。"
    };
    private static final String[][] COLLOQUIAL = {
            {"非常", "超级"}, {"很", "贼"}, {"可以", "能"}, {"好用", "好使"},
            {"推荐", "安利"}, {"真的", "确实"}, {"特别", "超"}, {"觉得", "感觉"},
    };
    private static final String[] KOL_HOOKS = {
            "", "宝子们", "集美们", "老铁们", "家人们"
    };

    @Override
    public List<String> rewrite(String original, int count, RewriteOptions options) {
        log.info("[MockLlm/rewrite] {} -> {} versions (style={})",
                preview(original), count, options == null ? "default" : options.getStyle());
        String style = options == null || options.getStyle() == null ? "default" : options.getStyle();

        List<String> out = new ArrayList<>();
        // 第一条始终是原文（让 N=1 时不变形）
        out.add(original);
        for (int i = 1; i < count; i++) {
            out.add(generateVariant(original, i, style));
        }
        return out;
    }

    @Override
    public String chat(String systemPrompt, String userPrompt, ChatOptions options) {
        log.info("[MockLlm/chat] sys={} user={}", preview(systemPrompt), preview(userPrompt));
        return "{\"mock\":true,\"echo\":\"" + escape(preview(userPrompt)) + "\"}";
    }

    private String generateVariant(String original, int idx, String style) {
        String bare = original.replaceAll("[。！？…\\.]+$", "");

        // 模式 1（约 1/3）：前缀 + 原文 + 后缀
        if (idx % 3 == 1) {
            String p = PREFIXES[idx % PREFIXES.length];
            String s = SUFFIXES[idx % SUFFIXES.length];
            String hook = "kol".equals(style) || "live-commerce".equals(style)
                    ? KOL_HOOKS[idx % KOL_HOOKS.length] + "，" : "";
            return hook + p + bare + "，" + s;
        }

        // 模式 2（约 1/3）：同义词替换
        if (idx % 3 == 2) {
            String v = original;
            for (String[] pair : COLLOQUIAL) {
                v = v.replace(pair[0], pair[1]);
            }
            return v;
        }

        // 模式 0：替换 + 加结尾
        String v = original;
        for (String[] pair : COLLOQUIAL) v = v.replace(pair[0], pair[1]);
        return v.replaceAll("[。！？…\\.]+$", "") + "，" + SUFFIXES[idx % SUFFIXES.length];
    }

    private static String preview(String s) {
        if (s == null) return "";
        return s.length() > 40 ? s.substring(0, 40) + "..." : s;
    }
    private static String escape(String s) { return s.replace("\\", "\\\\").replace("\"", "\\\""); }
}
