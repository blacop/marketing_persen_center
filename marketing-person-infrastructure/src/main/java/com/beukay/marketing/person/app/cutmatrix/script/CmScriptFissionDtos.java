package com.beukay.marketing.person.app.cutmatrix.script;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class CmScriptFissionDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FissionCmd {
        private String title;
        private List<ShotInput> shots;
        /** 每条分镜要生成几个版本（含原版），1-20 */
        private Integer count;
        /** 风格：default / colloquial / kol / live-commerce */
        private String style;

        @Data @Builder @NoArgsConstructor @AllArgsConstructor
        public static class ShotInput {
            private String name;
            private String content;
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FissionResult {
        private String status;          // SUCCEEDED / PARTIAL / FAILED
        /** 矩阵：matrix[shotIdx][versionIdx] */
        private List<List<String>> matrix;
        private String provider;
        private Long elapsedMs;
        private String errMsg;
    }

    /** 智能拆解 cmd */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DecomposeCmd {
        /** 待拆解口播文本 */
        private String text;
        /** 目标分镜数上限（可空，模型自决） */
        private Integer maxShots;
        /** 风格 default / kol */
        private String style;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DecomposeResult {
        private String status;          // SUCCEEDED / PARTIAL / FAILED
        private List<Shot> shots;
        private String provider;
        /** 是否走了正则兜底 */
        private Boolean fallbackUsed;
        private Long elapsedMs;
        private String errMsg;

        @Data @Builder @NoArgsConstructor @AllArgsConstructor
        public static class Shot {
            private String name;
            private String content;
        }
    }

    /** AI 文案调整 cmd：对已有矩阵做品牌替换 / 风格调整 / 卖点强化 */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AdjustCmd {
        /** 当前分镜列表 */
        private List<FissionCmd.ShotInput> shots;
        /** 当前矩阵 [shot][version]；为空则按 shots 重新生成 */
        private List<List<String>> matrix;
        /** 电商详情页 URL（可空，用于注入新产品上下文） */
        private String productUrl;
        /** 用户调整指令（如"把品牌 X 替换为 Y"、"加强保湿卖点"等） */
        private String instruction;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AdjustResult {
        private String status;          // SUCCEEDED / PARTIAL / FAILED
        /** 调整后矩阵；行列结构与输入一致 */
        private List<List<String>> matrix;
        /** 抓取的产品信息摘要（前端展示给用户看 LLM 看到了什么） */
        private String productSummary;
        private String provider;
        private Long elapsedMs;
        private String errMsg;
    }
}
