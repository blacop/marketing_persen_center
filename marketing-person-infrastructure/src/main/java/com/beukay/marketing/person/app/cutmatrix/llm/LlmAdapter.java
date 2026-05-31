package com.beukay.marketing.person.app.cutmatrix.llm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * LLM 文本生成适配器。
 * 多模块共享：script-fission / chapter-extract / live-loop / semantic-split。
 *
 * 实现：
 *   - MockLlmAdapter      开发期占位（默认）
 *   - QwenLlmAdapter      阿里 DashScope qwen-plus（待建）
 *   - DeepseekLlmAdapter  DeepSeek（待建）
 */
public interface LlmAdapter {

    /**
     * 改写：把 original 改写成 N 个不同版本，保持原意不变。
     * 用于 script-fission。
     */
    List<String> rewrite(String original, int count, RewriteOptions options) throws Exception;

    /**
     * 改写（带分镜名作为风格提示）。
     * shotName 例如 "遮瑕效果展示"、"行动号召"，告诉 LLM 这镜的语义角色，避免改写跑题。
     */
    default List<String> rewrite(String shotName, String original, int count, RewriteOptions options) throws Exception {
        return rewrite(original, count, options);
    }

    /**
     * 通用对话：单轮请求 → 单轮响应。
     * 用于 chapter-extract（章节切分）/ semantic-split（卖点识别）/ live-loop（商品识别）。
     */
    String chat(String systemPrompt, String userPrompt, ChatOptions options) throws Exception;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class RewriteOptions {
        /** 风格：default / colloquial / kol / live-commerce */
        private String style;
        /** 温度 0-2 */
        private Double temperature;
        /** 最大输出 token */
        private Integer maxTokens;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class ChatOptions {
        private Double temperature;
        private Integer maxTokens;
        private String responseFormat;  // 'text' | 'json'
    }
}
