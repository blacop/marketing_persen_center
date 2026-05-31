package com.beukay.marketing.person.app.cutmatrix.linkingest.asr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.nio.file.Path;
import java.util.List;

/**
 * 语音转写适配器接口。
 * 多模块共享：link-ingest / chapter-extract / subtitle-gen / semantic-split。
 *
 * 实现：
 *   - MockAsrAdapter      开发期占位
 *   - WhisperAsrAdapter   本地 whisper.cpp（待建）
 *   - AliyunAsrAdapter    阿里云 NLS 录音文件识别（待建）
 */
public interface AsrAdapter {

    AsrResult transcribe(Path audioFile, AsrOptions options) throws Exception;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class AsrOptions {
        /** 语言代码，zh/en/ja/auto，默认 zh */
        private String lang;
        /** 是否要词级时间戳（用于字幕生成） */
        private boolean wordTimestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class AsrResult {
        private String text;
        private List<Segment> segments;
        private String provider;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Segment {
            private double start;
            private double end;
            private String text;
        }
    }
}
