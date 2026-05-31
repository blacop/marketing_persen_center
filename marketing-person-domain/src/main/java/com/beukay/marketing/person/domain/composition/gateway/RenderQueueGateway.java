package com.beukay.marketing.person.domain.composition.gateway;

/**
 * 渲染队列网关。
 * 默认 AsyncLocalRenderQueueGatewayImpl（Spring @Async）；
 * 后续可换 RocketMq/Kafka 实现，业务侧零改动。
 */
public interface RenderQueueGateway {

    /** 提交一个 RenderJob 到队列；返回 message-id（实现可空） */
    String submitJob(Long jobId);

    /** 提交单条 RenderOutput 任务（job fan-out 后用） */
    String submitOutput(Long jobId, Long outputId);
}
