package com.beukay.marketing.person.app.cutmatrix.tts;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class CmTtsBatchDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BatchCmd {
        private String title;
        private String voiceId;
        private Double speed;
        /** 待合成条目 */
        private List<Item> items;

        @Data @Builder @NoArgsConstructor @AllArgsConstructor
        public static class Item {
            private Integer shotIdx;
            private Integer versionIdx;
            private String name;
            private String text;
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BatchResult {
        private String status;          // SUCCEEDED / PARTIAL / FAILED
        private String folderName;
        /** 导出包 zip URL（可空，未实现 zip 时返回 null） */
        private String zipUrl;
        private List<FileResult> files;
        private String provider;
        private Long elapsedMs;
        private String errMsg;

        @Data @Builder @NoArgsConstructor @AllArgsConstructor
        public static class FileResult {
            private Integer shotIdx;
            private Integer versionIdx;
            private String name;
            /** mp3 asset code */
            private String assetCode;
            /** 可播放/下载 URL */
            private String streamUrl;
            /** mp3 时长秒（可空，需 ffprobe） */
            private Double durationSec;
            private String status;       // success / failed
            private String errMsg;
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class VoiceListResult {
        private List<TtsAdapter.Voice> voices;
        private String provider;
    }
}
