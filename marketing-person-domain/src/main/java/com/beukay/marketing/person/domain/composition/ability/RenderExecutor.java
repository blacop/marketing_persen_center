package com.beukay.marketing.person.domain.composition.ability;

/**
 * 渲染执行器（Infrastructure 层实现 FFmpeg pipeline）。
 *
 * Domain 通过此接口触发实际渲染，不感知 ProcessBuilder / OSS / 临时目录等细节。
 */
public interface RenderExecutor {

    /** 渲染单条 RenderOutput；同步执行（由队列 consumer 调用） */
    void renderOutput(Long jobId, Long outputId);

    /** 接收 job 提交事件，由队列 consumer 调用：解析 plan → 触发各 output */
    void runJob(Long jobId);
}
