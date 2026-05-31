package com.beukay.marketing.person.infrastructure.composition.asr;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/** 阿里云百炼（DashScope）配置 —— ASR + LLM 归类 */
@Data
@Configuration
@ConfigurationProperties(prefix = "dashscope")
public class DashScopeProperties {

    /** Bearer token；通过 Nacos 或 DASHSCOPE_API_KEY 环境变量下发，不进 git */
    private String apiKey;

    /** ASR 模型（多模态 generation 接口） */
    private String asrModel = "qwen3-asr-flash";

    /** 归类用 LLM 模型（OpenAI 兼容 chat） */
    private String chatModel = "qwen-plus";

    /** 视觉语言模型（多模态 generation 接口）—— 看画面+文本归类 */
    private String vlModel = "qwen-vl-plus";

    /** 全模态模型（处理视频+文本）—— 直接看视频拆段 + 归类 */
    private String omniModel = "qwen3-omni-flash";

    /** 视频压缩后单段最大时长（秒）。qwen3-omni-flash 实测约 40s 上限，留 buffer 取 30。 */
    private int videoChunkSeconds = 30;

    /** 压缩视频的目标分辨率宽度 */
    private int videoCompressWidth = 480;

    /** 压缩视频的码率 (kbps) */
    private int videoCompressBitrateKbps = 256;

    /** 多模态 generation endpoint */
    private String generationEndpoint = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

    /** OpenAI 兼容 chat endpoint */
    private String chatEndpoint = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

    /** 单次 ASR 调用音频上限（毫秒），超过会被切块 */
    private long asrChunkMs = 240_000L; // 4 分钟，留 buffer

    /** 单次 HTTP 超时秒 */
    private int httpTimeoutSeconds = 120;
}
