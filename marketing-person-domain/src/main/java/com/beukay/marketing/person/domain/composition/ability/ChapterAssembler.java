package com.beukay.marketing.person.domain.composition.ability;

import com.beukay.marketing.person.client.composition.enums.ChapterAudioMode;
import com.beukay.marketing.person.client.composition.enums.OverflowTrimStrategy;
import com.beukay.marketing.person.domain.composition.model.ChapterPlan;
import com.beukay.marketing.person.domain.composition.model.ClipPick;
import com.beukay.marketing.person.domain.composition.model.CompositionChapter;
import com.beukay.marketing.person.domain.composition.model.MaterialClip;
import com.beukay.marketing.person.domain.composition.model.VoiceoverAsset;

import java.util.List;
import java.util.Random;

/**
 * 章节装配器：根据 audioMode 把章节配置 + 候选素材 + 配音 → ChapterPlan。
 * 纯函数，无 IO。
 */
public final class ChapterAssembler {

    private ChapterAssembler() {}

    /**
     * @param chapter   章节配置
     * @param pool      该章节可选素材池（已按 tag 过滤）
     * @param voiceover 该章节关联配音（可空，无配音模式时）
     * @param r         随机源
     */
    public static ChapterPlan assemble(CompositionChapter chapter,
                                       List<MaterialClip> pool,
                                       VoiceoverAsset voiceover,
                                       Random r) {
        ChapterAudioMode mode = ChapterAudioMode.valueOf(chapter.getAudioMode());
        OverflowTrimStrategy trim = chapter.getOverflowTrim() == null
                ? OverflowTrimStrategy.TRIM_TAIL
                : OverflowTrimStrategy.valueOf(chapter.getOverflowTrim());
        boolean allowReuse = Boolean.TRUE.equals(chapter.getAllowVoiceoverReuse());

        List<ClipPick> picks;
        long estDuration;

        switch (mode) {
            case ONE_VO_MULTI_CLIP -> {
                // AutoCut 模式 1：选 n 段原长视频 + 整体变速对齐配音（不裁切）
                int n = chapter.getFixedClipCount() == null ? 1 : chapter.getFixedClipCount();
                picks = ClipPicker.pickFixedCountFullLen(pool, n, false, r);
                estDuration = voDur(voiceover);
            }
            case FILL_CLIPS_FOR_VO -> {
                // AutoCut 模式 2：长度处理方式 = CROP 时贪心填到配音时长（末尾 trim）；
                //                = SPEED 时贪心累计到 ≥ voDur 不裁，配合章节级 speedFactor 整体变速对齐。
                long voDur = voDur(voiceover);
                boolean useSpeed = "SPEED".equalsIgnoreCase(chapter.getLengthAdjustMode());
                if (useSpeed) {
                    picks = ClipPicker.pickMinDuration(pool, voDur, false, r);
                } else {
                    picks = ClipPicker.alignToDuration(pool, voDur, trim, false, r);
                }
                estDuration = voDur;
            }
            case LOOP_CLIP_FOR_VO -> {
                // AutoCut 模式 3：循环策略 = FILL_THEN_CROP（默认）→ 重复到 voDur 末尾 trim；
                //                          = FIXED_ROUNDS_THEN_SPEED → 固定循环 N 轮，配合 speedFactor 变速对齐。
                long voDur = voDur(voiceover);
                String loopStrategy = chapter.getLoopStrategy();
                boolean fixedRounds = "FIXED_ROUNDS_THEN_SPEED".equalsIgnoreCase(loopStrategy);
                if (voDur <= 0) {
                    picks = ClipPicker.pickOneForLoop(pool, r);
                } else if (fixedRounds) {
                    int rounds = chapter.getLoopRounds() == null || chapter.getLoopRounds() <= 0
                            ? 1 : chapter.getLoopRounds();
                    picks = ClipPicker.pickFixedRoundsLoop(pool, rounds, r);
                } else {
                    picks = ClipPicker.pickLoopToDuration(pool, voDur, trim, r);
                }
                estDuration = voDur;
            }
            case NO_VO_FIXED_COUNT -> {
                // AutoCut 模式 4：每章节抽 n 个，原长拼接
                int n = chapter.getFixedClipCount() == null ? 1 : chapter.getFixedClipCount();
                picks = ClipPicker.pickFixedCount(pool, n, false, r);
                estDuration = picks.stream().mapToLong(p -> nullSafe(p.getTakenDurationMs())).sum();
            }
            case NO_VO_MIN_DURATION -> {
                // AutoCut 模式 5：累计 ≥ minMs 即停，末尾不裁，超出也保留
                long target = chapter.getMinDurationMs() == null ? 0 : chapter.getMinDurationMs();
                picks = ClipPicker.pickMinDuration(pool, target, false, r);
                estDuration = picks.stream().mapToLong(p -> nullSafe(p.getTakenDurationMs())).sum();
            }
            default -> throw new IllegalStateException("Unknown audioMode: " + mode);
        }

        // 章节级 speedFactor = sum(picks) / voDur，让原长画面整体对齐配音。
        // 适用：模式 1 整体变速；模式 2 长度处理=SPEED；模式 3 循环策略=FIXED_ROUNDS_THEN_SPEED。
        Double speedFactor = null;
        boolean needsSpeedFactor =
                mode == ChapterAudioMode.ONE_VO_MULTI_CLIP
                || (mode == ChapterAudioMode.FILL_CLIPS_FOR_VO
                        && "SPEED".equalsIgnoreCase(chapter.getLengthAdjustMode()))
                || (mode == ChapterAudioMode.LOOP_CLIP_FOR_VO
                        && "FIXED_ROUNDS_THEN_SPEED".equalsIgnoreCase(chapter.getLoopStrategy()));
        if (needsSpeedFactor) {
            long voDur = voDur(voiceover);
            long videoTotal = picks.stream().mapToLong(p -> nullSafe(p.getTakenDurationMs())).sum();
            if (voDur > 0 && videoTotal > 0) {
                speedFactor = (double) videoTotal / (double) voDur;
            }
        }

        return ChapterPlan.builder()
                .chapterId(chapter.getId())
                .sortNo(chapter.getSortNo())
                .chapterName(chapter.getName())
                .audioMode(mode.name())
                .voiceoverId(chapter.getVoiceoverId())
                .voiceoverOssKey(voiceover == null ? null : voiceover.getOssKey())
                .voiceoverDurationMs(voiceover == null ? null : voiceover.getDurationMs())
                .stripOriginalAudio(Boolean.TRUE.equals(chapter.getStripOriginalAudio()))
                .picks(picks)
                .estimatedDurationMs(estDuration)
                .speedFactor(speedFactor)
                .build();
    }

    private static long voDur(VoiceoverAsset vo) {
        return vo == null || vo.getDurationMs() == null ? 0L : vo.getDurationMs();
    }

    private static long nullSafe(Long v) { return v == null ? 0L : v; }
}
