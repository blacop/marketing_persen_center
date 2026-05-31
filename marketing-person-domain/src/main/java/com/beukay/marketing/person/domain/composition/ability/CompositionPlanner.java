package com.beukay.marketing.person.domain.composition.ability;

import com.beukay.marketing.person.domain.composition.model.CompositionPlan;
import com.beukay.marketing.person.domain.composition.model.CompositionProject;

import java.util.List;

/**
 * 合成规划器：项目 + 模式 + 策略 → N 条 CompositionPlan。
 *
 * 实现负责：加载章节、按 tag 拉取素材池、加载配音、调用 CombinationGenerator。
 */
public interface CompositionPlanner {

    /**
     * @param projectId  项目 id
     * @param overrideTargetCount 覆盖项目的 targetCount，可空
     */
    List<CompositionPlan> plan(Long projectId, Integer overrideTargetCount);

    /** 重载：已有 detail 的项目对象，避免重复 IO */
    List<CompositionPlan> plan(CompositionProject project, Integer overrideTargetCount);
}
