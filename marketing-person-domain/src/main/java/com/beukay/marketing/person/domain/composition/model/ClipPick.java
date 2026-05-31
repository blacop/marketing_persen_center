package com.beukay.marketing.person.domain.composition.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 单条选片决策（值对象）。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClipPick {

    private Long clipId;
    private String ossKey;
    private String originalName;
    /** 该素材在原片中的起始毫秒 */
    private Long startMs;
    /** 结束毫秒（可超过素材时长，由 FFmpeg 截断） */
    private Long endMs;
    /** 实际使用的时长 = endMs - startMs */
    private Long takenDurationMs;
    /** 原素材完整时长 */
    private Long originalDurationMs;
    /** 是否做了头/尾裁剪 */
    private Boolean trimmed;
}
