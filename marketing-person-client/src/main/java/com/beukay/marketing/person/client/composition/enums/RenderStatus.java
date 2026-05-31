package com.beukay.marketing.person.client.composition.enums;

/** 渲染任务/产出状态 */
public enum RenderStatus {
    PENDING,
    ASSEMBLING,
    DOWNLOADING,
    ENCODING,
    UPLOADING,
    SUCCESS,
    /** 仅 RenderJob 用：N 条产出有部分失败 */
    PARTIAL,
    FAILED,
    CANCELLED,
    RUNNING
}
