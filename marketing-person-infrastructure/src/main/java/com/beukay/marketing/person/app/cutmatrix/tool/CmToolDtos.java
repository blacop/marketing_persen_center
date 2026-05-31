package com.beukay.marketing.person.app.cutmatrix.tool;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class CmToolDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AspectConvertCmd {
        private String inputAssetCode;
        /** 目标比例 9:16 / 16:9 / 1:1 / 4:3 / 3:4 */
        private String targetAspect;
        /** 输出短边像素，可空（默认 1080） */
        private Integer shortEdge;
        /** fit / crop（默认 crop） */
        private String mode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AudioOpsCmd {
        private String inputAssetCode;
        /** 是否去除原声 */
        private Boolean removeOriginal;
        /** 加 BGM 的 asset code（可空） */
        private String bgmAssetCode;
        /** 0..2.0 倍数音量调整（默认 1.0） */
        private Double volume;
        /** BGM 倍数（默认 0.3） */
        private Double bgmVolume;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UniformSplitCmd {
        private String inputAssetCode;
        /** 每段秒数 */
        private Integer segmentSec;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SilenceFilterCmd {
        private String inputAssetCode;
        /** 静音阈值 dB（默认 -30） */
        private Integer noiseDb;
        /** 最小静音时长 秒（默认 0.5） */
        private Double minSilenceSec;
        /** 每个有用片段前保留秒数（默认 0.15） */
        private Double padBeforeSec;
        /** 每个有用片段后保留秒数（默认 0.05） */
        private Double padAfterSec;
        /** 仅去除片头片尾静音，中间静音保留（默认 false） */
        private Boolean headTailOnly;
        /** 节奏预设 slow / medium / fast / custom（custom 用上面参数） */
        private String pacing;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SceneSplitCmd {
        private String inputAssetCode;
        /** 场景变化阈值 0-1（默认 0.4） */
        private Double sceneThreshold;
        /** 每段最小秒数（过滤太短场景，默认 1.5） */
        private Double minSegmentSec;
    }

    /** 擦除字幕区域（坐标为百分比 0-100，由前端区域框换算） */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubtitleEraseCmd {
        private String inputAssetCode;
        /** 擦除区域列表，必填至少一个 */
        private List<RegionPct> regions;
        /** 填充模式：delogo（默认，周边像素插值）/ black（黑色填充） */
        private String fillMode;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class RegionPct {
            /** 左边距 0-100 % */
            private double x;
            /** 上边距 0-100 % */
            private double y;
            /** 宽度 0-100 % */
            private double w;
            /** 高度 0-100 % */
            private double h;
        }
    }

    /** 生成字幕：ASR → SRT/VTT 文件 */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubtitleGenCmd {
        private String inputAssetCode;
        /** srt / vtt / both */
        private String format;
        /** 语言：zh / en / auto */
        private String lang;
        /** 是否硬烧字幕到视频（生成带字幕 mp4） */
        private Boolean burnIn;
    }

    /** 添加背景：把视频铺到指定背景（颜色或图片）上 */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddBgCmd {
        private String inputAssetCode;
        /** 背景图 assetCode（可选，优先级高于 bgColor） */
        private String bgImageAssetCode;
        /** 背景颜色 hex (#RRGGBB)，bgImageAssetCode 缺省时使用 */
        private String bgColor;
        /** 输出宽 / 高 */
        private Integer outWidth;
        private Integer outHeight;
        /** 视频缩放：fit (整图保留留边) / cover (铺满裁剪) / scale (按 scaleRatio) */
        private String scaleMode;
        /** scaleRatio：0-1，相对输出短边的比例（默认 0.7） */
        private Double scaleRatio;
        /** 视频在背景中位置：center / top / bottom */
        private String anchor;
    }

    /** 裂变文字样式：在视频上叠加 N 种文字版本 */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TextStyleFissionCmd {
        private String inputAssetCode;
        private String text;
        /** 输出版本数 */
        private Integer count;
        /** 字号（像素） */
        private Integer fontSize;
        /** 字体颜色 hex */
        private String fontColor;
        /** 描边颜色 hex */
        private String borderColor;
        /** 文字位置百分比 0-100：x 中心 / y 中心 */
        private Double xPct;
        private Double yPct;
        /** 风格预设：default / shock / cute / business（不同字体粗细 + 阴影） */
        private String stylePreset;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ToolResultDto {
        private String status;        // SUCCEEDED / FAILED
        private String resultAssetCode;        // 单文件输出
        private String streamUrl;
        private List<String> resultAssetCodes;  // 多文件输出（拆分类）
        private List<String> streamUrls;
        private Double durationSec;
        private String message;
        private String stderrTail;
    }
}
