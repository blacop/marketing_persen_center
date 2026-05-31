package com.beukay.marketing.person.app.cutmatrix.semantic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class CmSemanticSplitDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SplitCmd {
        private String inputAssetCode;
        /** 模式：live（直播切片，30s-5h）/ short（短视频精细化，1s-1h） */
        private String mode;
        /** 目标文件夹列表（可空：仅切片不分类） */
        private List<TargetFolder> folders;

        @Data @Builder @NoArgsConstructor @AllArgsConstructor
        public static class TargetFolder {
            private String id;
            private String name;
            /** 可选：补充关键词帮助 LLM 分类（如 "去角质,洁面"） */
            private String keywords;
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SplitResult {
        private String status;          // SUCCEEDED / FAILED
        private List<Segment> segments;
        private Double durationSec;
        private String provider;
        private Long elapsedMs;
        private String errMsg;

        @Data @Builder @NoArgsConstructor @AllArgsConstructor
        public static class Segment {
            private Integer idx;
            private Double start;
            private Double end;
            private String text;
            /** 命中的目标文件夹 id（无匹配为空） */
            private String folderId;
            /** 命中文件夹的名称（冗余便于前端渲染） */
            private String folderName;
            /** 0-1 置信度 */
            private Double confidence;
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ExportCmd {
        private String inputAssetCode;
        /** 由前端传回最终的 segments（可能用户调整过分配） */
        private List<CmSemanticSplitDtos.SplitResult.Segment> segments;
        /** 目标文件夹列表（用于输出文件夹结构） */
        private List<SplitCmd.TargetFolder> folders;
        /** 导出格式：mp4 / jianying / both */
        private String format;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ExportResult {
        private String status;
        /** zip 包 URL（含 clips/ + jianying.draft.json） */
        private String zipUrl;
        /** 切片视频列表（assetCode + url） */
        private List<ClipFile> clips;
        /** 剪映工程文件 URL（json） */
        private String jianyingDraftUrl;
        private String errMsg;

        @Data @Builder @NoArgsConstructor @AllArgsConstructor
        public static class ClipFile {
            private Integer idx;
            private String folderName;
            private String fileName;
            private String assetCode;
            private String streamUrl;
            private Double durationSec;
        }
    }
}
