package com.beukay.marketing.person.infrastructure.composition.render;

import com.beukay.marketing.person.domain.composition.ability.RenderExecutor;
import com.beukay.marketing.person.domain.composition.gateway.RenderQueueGateway;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.concurrent.Executor;

/**
 * 渲染队列：本地线程池实现（PoC / 默认）。
 *
 * 同进程内通过 compositionRenderExecutor 线程池执行；后续可切换为 RocketMQ 实现，
 * 业务侧 RenderJobOrchestrator 零改动。
 *
 * 注意：不能用 @Async + 返回 String —— Spring @Async 仅允许 void / Future。
 * 直接拿线程池 submit 任务，方法本身同步返回伪 messageId（与未来 RocketMQ 的 msgId 概念对齐）。
 */
@Component
@Log4j2
public class AsyncLocalRenderQueueGatewayImpl implements RenderQueueGateway {

    private final RenderExecutor renderExecutor;
    private final Executor renderPool;

    @Autowired
    public AsyncLocalRenderQueueGatewayImpl(
            @Lazy RenderExecutor renderExecutor,
            @Qualifier("compositionRenderExecutor") Executor renderPool) {
        this.renderExecutor = renderExecutor;
        this.renderPool = renderPool;
    }

    @Override
    public String submitJob(Long jobId) {
        runAfterCommit(() -> {
            try {
                log.info("[queue.async] runJob jobId={}", jobId);
                renderExecutor.runJob(jobId);
            } catch (Throwable t) {
                log.error("[queue.async] runJob failed jobId={}", jobId, t);
            }
        });
        return "local-job-" + jobId;
    }

    @Override
    public String submitOutput(Long jobId, Long outputId) {
        runAfterCommit(() -> {
            try {
                renderExecutor.renderOutput(jobId, outputId);
            } catch (Throwable t) {
                log.error("[queue.async] renderOutput failed job={} out={}", jobId, outputId, t);
            }
        });
        return "local-out-" + outputId;
    }

    /**
     * 调用方在 @Transactional 内时，等事务 commit 之后再投线程池；
     * 否则立即投。避免消费者读不到刚 insert 但尚未 commit 的行。
     */
    private void runAfterCommit(Runnable task) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    renderPool.execute(task);
                }
            });
        } else {
            renderPool.execute(task);
        }
    }
}
