package com.beukay.marketing.person.domain.composition.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** 单条成片完整执行计划 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompositionPlan {

    /** SHA-256，唯一去重 key */
    private String planHash;
    private List<ChapterPlan> chapters;
    /** 全局 BGM/配音 */
    private Long globalBgmVoiceoverId;
    private String globalBgmOssKey;
    /** 输出分辨率 / fps */
    private Integer outputWidth;
    private Integer outputHeight;
    private Integer outputFps;
    /** 估算总时长 */
    private Long estimatedDurationMs;
}
