package com.beukay.marketing.person.domain.composition.ability.impl;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.client.composition.enums.RenderStatus;
import com.beukay.marketing.person.domain.composition.ability.CompositionPlanner;
import com.beukay.marketing.person.domain.composition.ability.RenderJobService;
import com.beukay.marketing.person.domain.composition.gateway.RenderJobGateway;
import com.beukay.marketing.person.domain.composition.gateway.RenderOutputGateway;
import com.beukay.marketing.person.domain.composition.gateway.RenderQueueGateway;
import com.beukay.marketing.person.domain.composition.model.CompositionPlan;
import com.beukay.marketing.person.domain.composition.model.RenderConfig;
import com.beukay.marketing.person.domain.composition.model.RenderJob;
import com.beukay.marketing.person.domain.composition.model.RenderOutput;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Log4j2
public class RenderJobServiceImpl implements RenderJobService {

    private final RenderJobGateway renderJobGateway;
    private final RenderOutputGateway renderOutputGateway;
    private final RenderQueueGateway renderQueueGateway;
    private final CompositionPlanner compositionPlanner;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RenderJob submit(Long projectId, Integer overrideCount, RenderConfig renderConfig, List<String> selectedPlanHashes) {
        // 1. 跑组合算法
        // 选了 hash 子集时按 hash 数量上限跑（保证 planner 至少能产出选中那一批），否则按 overrideCount。
        Integer plannerN = (selectedPlanHashes != null && !selectedPlanHashes.isEmpty())
                ? selectedPlanHashes.size()
                : overrideCount;
        // 由于跨次调用 planner 受同一种子约束，过滤可能丢失部分 hash；
        // 跑大一些（×2）再过滤更稳。但还是上限 1000 兜底。
        if (plannerN != null) plannerN = Math.min(1000, plannerN * 2);
        List<CompositionPlan> plans = compositionPlanner.plan(projectId, plannerN);
        if (plans.isEmpty()) {
            throw new IllegalStateException("no plans generated; check chapter tag filter & material pool");
        }
        if (selectedPlanHashes != null && !selectedPlanHashes.isEmpty()) {
            Set<String> wanted = new HashSet<>(selectedPlanHashes);
            plans = plans.stream().filter(p -> wanted.contains(p.getPlanHash())).toList();
            if (plans.isEmpty()) {
                throw new IllegalStateException("selected plan hashes not in current generation; please re-preview");
            }
        }

        // 2. 落 RenderJob (PENDING)
        RenderJob job = RenderJob.builder()
                .projectId(projectId)
                .totalCount(plans.size())
                .successCount(0)
                .failedCount(0)
                .status(RenderStatus.PENDING.name())
                .progressPercent(0)
                .renderConfig(renderConfig)
                .build();
        job = renderJobGateway.save(job);

        // 3. 为每条 plan 落 RenderOutput (PENDING)
        for (CompositionPlan p : plans) {
            RenderOutput out = RenderOutput.builder()
                    .jobId(job.getId())
                    .projectId(projectId)
                    .planHash(p.getPlanHash())
                    .planSnapshot(serialize(p))
                    .status(RenderStatus.PENDING.name())
                    .build();
            renderOutputGateway.save(out);
        }

        // 4. 投递队列；失败回滚 RenderJob 自动撤销
        String mqId = renderQueueGateway.submitJob(job.getId());
        job.setMqMessageId(mqId);
        return renderJobGateway.save(job);
    }

    @Override
    public RenderJob getById(Long id) {
        return renderJobGateway.findById(id);
    }

    @Override
    public PageInfo<RenderJob> page(Long projectId, String status, PageQuery pageQuery) {
        return renderJobGateway.page(projectId, status, pageQuery);
    }

    @Override
    public List<RenderOutput> outputs(Long jobId) {
        return renderOutputGateway.findByJobId(jobId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancel(Long jobId) {
        RenderJob job = renderJobGateway.findById(jobId);
        if (job == null) return;
        if (RenderStatus.SUCCESS.name().equals(job.getStatus())
                || RenderStatus.FAILED.name().equals(job.getStatus())
                || RenderStatus.CANCELLED.name().equals(job.getStatus())) {
            return;
        }
        job.setStatus(RenderStatus.CANCELLED.name());
        job.setFinishedAt(LocalDateTime.now());
        renderJobGateway.save(job);
        // 同步把还在 PENDING 的 outputs 标记为 CANCELLED
        for (RenderOutput o : renderOutputGateway.findByJobId(jobId)) {
            if (RenderStatus.PENDING.name().equals(o.getStatus())) {
                o.setStatus(RenderStatus.CANCELLED.name());
                o.setFinishedAt(LocalDateTime.now());
                renderOutputGateway.save(o);
            }
        }
    }

    private String serialize(CompositionPlan p) {
        try {
            return objectMapper.writeValueAsString(p);
        } catch (JsonProcessingException e) {
            log.warn("[render] serialize plan snapshot failed", e);
            return null;
        }
    }
}
