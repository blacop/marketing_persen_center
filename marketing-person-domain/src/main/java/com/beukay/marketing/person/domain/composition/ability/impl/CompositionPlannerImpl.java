package com.beukay.marketing.person.domain.composition.ability.impl;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.client.composition.enums.CombinationStrategy;
import com.beukay.marketing.person.domain.composition.ability.CombinationGenerator;
import com.beukay.marketing.person.domain.composition.ability.CompositionPlanner;
import com.beukay.marketing.person.domain.composition.gateway.MaterialClipGateway;
import com.beukay.marketing.person.domain.composition.gateway.VoiceoverAssetGateway;
import com.beukay.marketing.person.domain.composition.gateway.CompositionProjectGateway;
import com.beukay.marketing.person.domain.composition.model.CompositionChapter;
import com.beukay.marketing.person.domain.composition.model.CompositionPlan;
import com.beukay.marketing.person.domain.composition.model.CompositionProject;
import com.beukay.marketing.person.domain.composition.model.MaterialClip;
import com.beukay.marketing.person.domain.composition.model.MaterialTag;
import com.beukay.marketing.person.domain.composition.model.VoiceoverAsset;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Log4j2
public class CompositionPlannerImpl implements CompositionPlanner {

    private static final int MAX_POOL_PER_CHAPTER = 1000;

    private final CompositionProjectGateway projectGateway;
    private final MaterialClipGateway materialClipGateway;
    private final VoiceoverAssetGateway voiceoverAssetGateway;

    @Override
    public List<CompositionPlan> plan(Long projectId, Integer overrideTargetCount) {
        CompositionProject project = projectGateway.findDetailById(projectId);
        if (project == null) {
            throw new IllegalArgumentException("project not found: " + projectId);
        }
        return plan(project, overrideTargetCount);
    }

    @Override
    public List<CompositionPlan> plan(CompositionProject project, Integer overrideTargetCount) {
        List<CompositionChapter> chapters = project.getChapters();
        if (chapters == null || chapters.isEmpty()) {
            throw new IllegalStateException("project has no chapters: " + project.getId());
        }
        int targetN = overrideTargetCount != null ? overrideTargetCount
                : (project.getTargetCount() == null ? 10 : project.getTargetCount());
        targetN = Math.max(1, Math.min(1000, targetN));

        Map<Long, List<MaterialClip>> poolByCh = new HashMap<>();
        // 章节多配音池：每章节 List<VoiceoverAsset>，CombinationGenerator 在每次 attempt 里随机选一个，
        // 配音 ID 进入 plan hash → 不同配音组合各自独立去重
        Map<Long, List<VoiceoverAsset>> voiceoverPoolByCh = new HashMap<>();
        for (CompositionChapter ch : chapters) {
            List<MaterialClip> pool;
            if (ch.getMaterialClipIds() != null && !ch.getMaterialClipIds().isEmpty()) {
                // FOLDER 模式：按 chapter 直接配置的 clipId 拿素材，保持上传顺序
                pool = new ArrayList<>(ch.getMaterialClipIds().size());
                for (Long clipId : ch.getMaterialClipIds()) {
                    MaterialClip clip = materialClipGateway.findById(clipId);
                    if (clip != null) pool.add(clip);
                }
            } else {
                // 优先按 category 选片（诸葛亮 9 章节模式），未设 category 时回落到 tag_filter
                List<Long> tagIds = ch.getTagFilter() == null ? List.of()
                        : ch.getTagFilter().stream().map(MaterialTag::getId).toList();
                PageQuery pq = PageQuery.builder().pageIndex(1L).pageSize((long) MAX_POOL_PER_CHAPTER).build();
                PageInfo<MaterialClip> page = materialClipGateway.page(null, null,
                        tagIds.isEmpty() ? null : tagIds, null, ch.getCategory(), pq);
                pool = page.getRecords() == null ? List.of() : page.getRecords();
            }
            poolByCh.put(ch.getId(), pool);

            // 多配音池：voiceoverIds 优先；空时回落到 voiceoverId 单值
            List<VoiceoverAsset> voPool = new ArrayList<>();
            if (ch.getVoiceoverIds() != null && !ch.getVoiceoverIds().isEmpty()) {
                for (Long voId : ch.getVoiceoverIds()) {
                    VoiceoverAsset v = voiceoverAssetGateway.findById(voId);
                    if (v != null) voPool.add(v);
                }
            } else if (ch.getVoiceoverId() != null) {
                VoiceoverAsset v = voiceoverAssetGateway.findById(ch.getVoiceoverId());
                if (v != null) voPool.add(v);
            }
            if (!voPool.isEmpty()) {
                voiceoverPoolByCh.put(ch.getId(), voPool);
            }
        }

        CombinationStrategy strategy = project.getCombinationStrategy() == null
                ? CombinationStrategy.ROOKIE
                : CombinationStrategy.valueOf(project.getCombinationStrategy());

        // BGM 库（FOLDER 模式 bgm/ 子目录）每条 plan 随机抽一首；空时回落到旧的 globalBgmVoiceoverId
        List<VoiceoverAsset> bgmPool = new ArrayList<>();
        if (project.getBgmVoiceoverIds() != null && !project.getBgmVoiceoverIds().isEmpty()) {
            for (Long bgmId : project.getBgmVoiceoverIds()) {
                VoiceoverAsset b = voiceoverAssetGateway.findById(bgmId);
                if (b != null) bgmPool.add(b);
            }
        }
        VoiceoverAsset legacyBgm = project.getGlobalBgmVoiceoverId() == null ? null
                : voiceoverAssetGateway.findById(project.getGlobalBgmVoiceoverId());

        long seed = project.getId() == null ? System.nanoTime() : project.getId();
        return CombinationGenerator.generate(chapters, poolByCh, voiceoverPoolByCh,
                strategy, targetN, seed,
                p -> {
                    p.setOutputWidth(project.getOutputWidth());
                    p.setOutputHeight(project.getOutputHeight());
                    p.setOutputFps(project.getOutputFps());
                    // 每条 plan 按 hash 从 BGM 库随机选一首（同一作品稳定，不同作品分散）
                    int hashSeed = p.getPlanHash() == null ? 0 : p.getPlanHash().hashCode();
                    VoiceoverAsset chosenBgm = legacyBgm;
                    if (!bgmPool.isEmpty()) {
                        chosenBgm = bgmPool.get(Math.floorMod(hashSeed, bgmPool.size()));
                    }
                    p.setGlobalBgmVoiceoverId(chosenBgm == null ? null : chosenBgm.getId());
                    p.setGlobalBgmOssKey(chosenBgm == null ? null : chosenBgm.getOssKey());
                    return p;
                });
    }
}
