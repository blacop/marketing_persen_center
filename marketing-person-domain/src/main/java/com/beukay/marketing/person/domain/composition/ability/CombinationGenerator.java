package com.beukay.marketing.person.domain.composition.ability;

import com.beukay.marketing.person.client.composition.enums.CombinationStrategy;
import com.beukay.marketing.person.domain.composition.model.ChapterPlan;
import com.beukay.marketing.person.domain.composition.model.CompositionChapter;
import com.beukay.marketing.person.domain.composition.model.CompositionPlan;
import com.beukay.marketing.person.domain.composition.model.MaterialClip;
import com.beukay.marketing.person.domain.composition.model.VoiceoverAsset;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.function.Function;

/**
 * 组合生成器（采样 + 哈希去重）。
 *
 * 不做全枚举：N=1000 上限即可，避免 5×100 = 100 亿组合爆炸。
 * 算法：每次循环为每章节独立 assemble 一次（内部已 shuffle），sha256 去重；
 * 同 hash 跳过；超过最大尝试次数 break。
 */
public final class CombinationGenerator {

    private CombinationGenerator() {}

    /**
     * @param chapters          项目章节（按 sortNo 排序）
     * @param poolByCh          每个章节的候选素材池（key = chapterId）
     * @param voiceoverPoolByCh 每个章节的配音池（key = chapterId，每次 attempt 随机抽 1 个，作为该次组合的配音；
     *                          配音 ID 进入 plan hash → 不同配音视为不同组合）
     * @param strategy          组合策略 ROOKIE / MATRIX
     * @param targetN           目标条数（≤1000）
     * @param baseSeed          随机种子（同 project 复现）
     * @param finalizer         每条 plan 生成后做最后处理（填充全局 BGM、输出尺寸等）
     */
    public static List<CompositionPlan> generate(List<CompositionChapter> chapters,
                                                 Map<Long, List<MaterialClip>> poolByCh,
                                                 Map<Long, List<VoiceoverAsset>> voiceoverPoolByCh,
                                                 CombinationStrategy strategy,
                                                 int targetN,
                                                 long baseSeed,
                                                 Function<CompositionPlan, CompositionPlan> finalizer) {
        Set<String> seen = new HashSet<>();
        List<CompositionPlan> out = new ArrayList<>();
        if (chapters == null || chapters.isEmpty() || targetN <= 0) {
            return out;
        }
        int maxAttempts = Math.max(targetN * 20, 50);
        Random r = new Random(baseSeed);

        for (int attempt = 0; attempt < maxAttempts && out.size() < targetN; attempt++) {
            List<ChapterPlan> chapterPlans = new ArrayList<>(chapters.size());
            long totalDur = 0;
            for (CompositionChapter ch : chapters) {
                List<MaterialClip> pool = poolByCh.getOrDefault(ch.getId(), List.of());
                if (pool.isEmpty()) {
                    // 该章节素材池为空 → 直接跳过这一段，不让整条 plan 失败
                    continue;
                }
                // 多配音池：每次 attempt 随机选一个作为该次组合的配音；配音不同 → plan hash 不同
                List<VoiceoverAsset> voPool = voiceoverPoolByCh == null
                        ? List.of()
                        : voiceoverPoolByCh.getOrDefault(ch.getId(), List.of());
                VoiceoverAsset vo = voPool.isEmpty() ? null : voPool.get(r.nextInt(voPool.size()));
                ChapterPlan cp = ChapterAssembler.assemble(ch, pool, vo, r);
                if (cp.getPicks() == null || cp.getPicks().isEmpty()) {
                    // 选片失败（如配音模式但没配音）也跳过本章节
                    continue;
                }
                chapterPlans.add(cp);
                totalDur += cp.getEstimatedDurationMs() == null ? 0 : cp.getEstimatedDurationMs();
            }
            // 所有章节都空才认为本条 plan 失败
            if (chapterPlans.isEmpty()) continue;

            CompositionPlan plan = CompositionPlan.builder()
                    .chapters(chapterPlans)
                    .estimatedDurationMs(totalDur)
                    .build();
            if (finalizer != null) {
                plan = finalizer.apply(plan);
            }
            String hash = PlanHasher.sha256(PlanHasher.signature(plan));
            plan.setPlanHash(hash);
            if (seen.add(hash)) {
                out.add(plan);
            }
            // ROOKIE 不复用素材的硬约束在 ClipPicker 内已通过 allowReuse=false 实现；
            // 此处的 strategy 主要用于未来扩展（如全局禁用同 clip 跨条出现），M2 暂未启用。
            if (strategy == CombinationStrategy.ROOKIE) {
                // no-op：当前依赖 ClipPicker 章节内不复用，跨条复用容忍以提高 throughput
            }
        }
        return out;
    }
}
