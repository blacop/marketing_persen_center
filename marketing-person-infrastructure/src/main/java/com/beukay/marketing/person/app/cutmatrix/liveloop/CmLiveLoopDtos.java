package com.beukay.marketing.person.app.cutmatrix.liveloop;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 直播话术循环检测 DTOs
 *
 * 一个 Loop = 一轮完整的产品讲解（欢迎 → 介绍 → 卖点 → 收单），
 * 内部由若干带时间戳的 sentences 组成。前端勾选 loop 后批量切片导出。
 */
public class CmLiveLoopDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DetectCmd {
        /** cm-storage 视频 assetCode */
        private String inputAssetCode;
        /** ASR 语言：中文及方言 / 普通话 / 粤语 / 英语 */
        private String lang;
        /** 最小循环时长（秒），过短的产品讲解会被合并 */
        private Double minLoopSec;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DetectResult {
        private String status; // SUCCEEDED / FAILED
        private List<Loop> loops;
        private Double durationSec;
        private String provider;
        private Long elapsedMs;
        private String errMsg;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Loop {
        private Integer idx;
        /** 推断的产品名（来自高频名词 / 商品贴纸 OCR） */
        private String productName;
        private Double start;
        private Double end;
        private List<Sentence> sentences;
        /** 该循环命中的关键词 chip */
        private List<String> keywords;
        /** 用户勾选标记（导出时用） */
        private Boolean selected;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Sentence {
        private Double start;
        private Double end;
        private String text;
        /** LLM 标记的黄金卖点 / 钩子话术 */
        private Boolean isHighlight;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ExportCmd {
        private String inputAssetCode;
        private List<Loop> loops;
        /** mp4 / mov */
        private String format;
        /** h264 / hevc */
        private String codec;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ExportResult {
        private String status;
        /** 打包后 zip 下载地址 */
        private String zipUrl;
        private Integer clipCount;
        private String errMsg;
    }
}
