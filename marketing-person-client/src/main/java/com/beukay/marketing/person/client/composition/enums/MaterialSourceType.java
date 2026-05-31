package com.beukay.marketing.person.client.composition.enums;

/** 素材来源（Phase 2 接缝：区分人工上传与上游拆解 agent） */
public enum MaterialSourceType {
    /** 人工上传 */
    MANUAL_UPLOAD,
    /** 爆款拆解 agent 自动入库 */
    DECONSTRUCTION_AGENT
}
