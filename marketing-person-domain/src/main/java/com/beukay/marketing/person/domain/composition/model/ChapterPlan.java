package com.beukay.marketing.person.domain.composition.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** 章节执行计划 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterPlan {

    private Long chapterId;
    private Integer sortNo;
    private String chapterName;
    /** ChapterAudioMode */
    private String audioMode;
    /** 配音 OSS key + 时长（可空，无配音模式时） */
    private Long voiceoverId;
    private String voiceoverOssKey;
    private Long voiceoverDurationMs;
    /** 是否去除素材原音 */
    private Boolean stripOriginalAudio;
    /** 选好的镜头序列（按播放顺序） */
    private List<ClipPick> picks;
    /** 该章节预期总时长（毫秒） */
    private Long estimatedDurationMs;
    /**
     * 章节级整体速度倍率：1.0 = 原速，>1 加快，&lt;1 减慢。
     * 模式 1（一个配音多个视频）算法用 sum(picks) / voDur 作为变速值，使视频整段对齐配音。
     * DaVinci 渲染时 segment 的 speed 字段取此值；ffmpeg 路径暂未实现。
     */
    private Double speedFactor;
}
