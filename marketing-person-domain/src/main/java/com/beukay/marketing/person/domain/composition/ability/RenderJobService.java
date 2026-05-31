package com.beukay.marketing.person.domain.composition.ability;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.composition.model.RenderConfig;
import com.beukay.marketing.person.domain.composition.model.RenderJob;
import com.beukay.marketing.person.domain.composition.model.RenderOutput;

import java.util.List;

/**
 * 渲染任务编排领域服务。
 */
public interface RenderJobService {

    /**
     * 创建并提交渲染任务：跑 CompositionPlanner → 落 N 条 PENDING 的 RenderOutput → 投递队列。
     * 返回 PENDING 的 RenderJob。
     */
    RenderJob submit(Long projectId, Integer overrideCount, RenderConfig renderConfig, List<String> selectedPlanHashes);

    RenderJob getById(Long id);

    PageInfo<RenderJob> page(Long projectId, String status, PageQuery pageQuery);

    List<RenderOutput> outputs(Long jobId);

    /** 取消（仅 PENDING / RUNNING 状态有效） */
    void cancel(Long jobId);
}
