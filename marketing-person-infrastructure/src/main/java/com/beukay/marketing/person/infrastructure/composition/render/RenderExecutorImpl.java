package com.beukay.marketing.person.infrastructure.composition.render;

import com.beukay.marketing.person.client.composition.enums.RenderStatus;
import com.beukay.marketing.person.domain.composition.ability.RenderExecutor;
import com.beukay.marketing.person.domain.composition.gateway.RenderJobGateway;
import com.beukay.marketing.person.domain.composition.gateway.RenderOutputGateway;
import com.beukay.marketing.person.domain.composition.model.RenderJob;
import com.beukay.marketing.person.domain.composition.model.RenderOutput;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.Semaphore;

@Service
@RequiredArgsConstructor
@Log4j2
public class RenderExecutorImpl implements RenderExecutor {

    private final RenderJobGateway renderJobGateway;
    private final RenderOutputGateway renderOutputGateway;
    private final RenderPipeline renderPipeline;
    private final CompositionRenderProperties props;

    private volatile Semaphore semaphore;

    private Semaphore semaphore() {
        if (semaphore == null) {
            synchronized (this) {
                if (semaphore == null) {
                    semaphore = new Semaphore(Math.max(1, props.getParallelism()));
                }
            }
        }
        return semaphore;
    }

    /**
     * 接收 JobSubmit 事件：把 job 标记 RUNNING，
     * 然后逐条派发 output 到 renderOutput（由队列或本地 @Async 触发）。
     *
     * 注意：本期 AsyncLocalRenderQueueGatewayImpl 在 submitJob 时已直接调用过本方法，
     * 所以这里的实现走"同进程逐条 render（在异步上下文中）"。
     */
    @Override
    public void runJob(Long jobId) {
        RenderJob job = renderJobGateway.findById(jobId);
        if (job == null) {
            log.warn("[render.runJob] job not found id={}", jobId);
            return;
        }
        job.setStatus(RenderStatus.RUNNING.name());
        job.setStartedAt(LocalDateTime.now());
        renderJobGateway.save(job);

        List<RenderOutput> outputs = renderOutputGateway.findByJobId(jobId);
        for (RenderOutput o : outputs) {
            if (RenderStatus.PENDING.name().equals(o.getStatus())) {
                renderOutput(jobId, o.getId());
            }
        }
    }

    @Override
    public void renderOutput(Long jobId, Long outputId) {
        try {
            semaphore().acquire();
            try {
                renderPipeline.render(jobId, outputId);
            } finally {
                semaphore().release();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("[render.output] interrupted job={} output={}", jobId, outputId);
        }
    }
}
