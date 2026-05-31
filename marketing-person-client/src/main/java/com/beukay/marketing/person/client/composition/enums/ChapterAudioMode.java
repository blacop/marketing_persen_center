package com.beukay.marketing.person.client.composition.enums;

/** 章节音画策略（5 种） */
public enum ChapterAudioMode {
    /** 一段配音覆盖该章节多个画面（需 fixedClipCount） */
    ONE_VO_MULTI_CLIP,
    /** 按配音时长自动填够画面 */
    FILL_CLIPS_FOR_VO,
    /** 单片循环播放匹配配音时长 */
    LOOP_CLIP_FOR_VO,
    /** 无配音，固定素材数（需 fixedClipCount） */
    NO_VO_FIXED_COUNT,
    /** 无配音，至少 X 秒（需 minDurationMs） */
    NO_VO_MIN_DURATION
}
