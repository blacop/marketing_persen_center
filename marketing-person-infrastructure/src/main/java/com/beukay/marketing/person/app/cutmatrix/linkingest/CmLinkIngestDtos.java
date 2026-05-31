package com.beukay.marketing.person.app.cutmatrix.linkingest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class CmLinkIngestDtos {

    /** Parse cmd：批量传 URL，返回每条解析结果 */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ParseCmd {
        private List<String> urls;
        /** 自动去除文件名表情 */
        private Boolean stripEmoji;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ParseResultItem {
        private String sourceUrl;
        private String platform;
        private String title;
        private String mediaType;
        private String mediaUrl;
        private Double durationSec;
        /** 解析失败时填错误信息，其他字段为空 */
        private String errMsg;
    }

    /** Download cmd：单条 URL（已知直链）触发后端下载到 cm-storage */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DownloadCmd {
        private String sourceUrl;
        private String mediaUrl;
        private String title;
        private String platform;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DownloadResult {
        private String status;          // SUCCEEDED / FAILED
        /** 主资源（视频/音频/图片）assetCode + streamUrl */
        private String assetCode;
        private String streamUrl;
        /** 抽出的纯音频（视频源才有；mp3） */
        private String audioAssetCode;
        private String audioStreamUrl;
        /** 视频封面（视频源才有；jpg） */
        private String thumbnailAssetCode;
        private String thumbnailUrl;
        private Long sizeBytes;
        private Double durationSec;
        private Integer width;
        private Integer height;
        private String errMsg;
    }

    /** Transcribe cmd：从 assetCode 抽音轨 + ASR */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TranscribeCmd {
        private String inputAssetCode;
        private String lang;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TranscribeResult {
        private String status;
        private String captionText;
        private List<Segment> segments;
        private String provider;
        private String errMsg;

        @Data @Builder @NoArgsConstructor @AllArgsConstructor
        public static class Segment {
            private double start;
            private double end;
            private String text;
        }
    }
}
