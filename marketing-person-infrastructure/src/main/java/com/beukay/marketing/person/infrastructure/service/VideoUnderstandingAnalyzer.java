package com.beukay.marketing.person.infrastructure.service;

import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public interface VideoUnderstandingAnalyzer {

    VideoUnderstandingAnalysis analyze(VideoUnderstandingRequest request);

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class VideoUnderstandingRequest {

        private String skuId;
        private String sourceName;
        private ProductTruth productTruth;
        private FfmpegVideoPreprocessor.PreparedVideoAssets preparedVideoAssets;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class VideoUnderstandingAnalysis {

        /** 视频级摘要 */
        private String summary;
        private String transcript;
        private List<String> ocrTexts;
        private List<Map<String, Object>> frameObservations;
        private String hookType;
        private String titlePattern;
        private List<String> sceneTags;
        private List<String> sellingPointTags;
        private List<String> ctaTags;
        private List<String> emotionTags;
        private List<String> targetAudienceTags;
        private String reasoning;
        /** 片段级拆解（最小单元库，与飞书知识库对齐） */
        private List<VideoSegment> segments;
    }

    /**
     * 视频最小单元（片段级拆解结果）
     * 字段体系与飞书「最小单元库」对齐
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class VideoSegment {

        /** 片段序号（从1开始） */
        private int index;
        /** 开始秒 */
        private int startSec;
        /** 结束秒 */
        private int endSec;
        /**
         * 结构标签
         * 候选：钩子/功效可视化/产品亮相/妆效展示/达人演绎/口播证言/街拍证言/活动机制/
         *       反视觉疲劳/妆效展示-全妆/妆效展示-反面教材/妆效展示-妆前妆后对比/
         *       达人演绎-好奇心引入/达人演绎-产品展示/达人演绎-问题展示/达人演绎-使用体验/
         *       达人演绎-功效论证/妆效展示-左右脸对比/CTA收尾/定制实测/明星口播/
         *       街拍采访/行动号召/明星实证/口碑实证/妆效展示-左右脸实测
         */
        private String structureTag;
        /**
         * 动机
         * 候选：痛点/卖点/亮点/拉踩点/转化点/技术点/打消顾虑点
         */
        private String motivation;
        /**
         * 手法
         * 候选：情绪渲染/问题展示/产品讲解/功效描述/动作演示/对比实证/个人体验/权威背书/打消顾虑/口碑背书
         */
        private String technique;
        /**
         * 镜头语言
         * 候选：特写/全景/POV/手持/固定/中景/中近景/面部特写
         */
        private String cameraLanguage;
        /**
         * 场景
         * 候选：浴室/梳妆台/通勤/户外/办公室/直播间/街拍/室内/桌面/多源混剪/非美妆/多场景/精致室内/户外自然光
         */
        private String scene;
        /** 信号强度 1-5 */
        private int signalStrength;
        /** 金句（用 | 分隔关键词） */
        private String keyPhrase;
        /** 对应话术 */
        private String script;
        /** 卖点内容 */
        private String sellingPoint;
        /** 是否决定性画面 */
        private boolean decisiveFrame;
        /** 决定性画面描述 */
        private String decisiveFrameDesc;
        /**
         * 人物量级
         * 候选：模特/无人物/明星/素人/KOC
         */
        private String influencerLevel;
        /**
         * 人物画像
         * 候选：精致妈妈/新锐白领/Z世代/资深中产/小镇青年/都市蓝领/都市银发/无人物
         */
        private String audiencePersona;
        /**
         * BGM
         * 候选：无/轻快/ASMR/热门曲/紧迫感/轻音乐
         */
        private String bgm;
        /**
         * 节奏
         * 候选：快剪/中速/慢推/ASMR极慢/慢剪
         */
        private String rhythm;
        /**
         * 服化道
         * 候选：浴袍/通勤装/约会装/运动装/居家服/卸颜/居家真实
         */
        private String wardrobe;
        /**
         * 声音
         * 候选：达人原声/专业旁白/无人声
         */
        private String audio;
        /**
         * 肤质肤况
         * 候选：干皮敏感/混油/暗沉/毛孔/痘肌/正常肌/混油皮/不适用
         */
        private String skinType;
        /** 热点关键词 */
        private String trending;
    }
}
