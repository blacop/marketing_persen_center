package com.beukay.marketing.person.app.cutmatrix;

import com.beukay.marketing.person.client.cmd.CmParagraphAlignCmd;
import com.beukay.marketing.person.client.dto.CmComposeResultDTO;
import com.beukay.marketing.person.domain.cutmatrix.chapter.gateway.CmChapterGateway;
import com.beukay.marketing.person.domain.cutmatrix.chapter.model.CmChapter;
import com.beukay.marketing.person.domain.cutmatrix.segment.gateway.CmVideoSegmentGateway;
import com.beukay.marketing.person.domain.cutmatrix.segment.model.CmVideoSegment;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 段落对齐编排核心算法（cm-paragraph-aligner Agent 内核）
 *
 * 输入：blueprint sections + 品名素材池
 * 输出：每段顺序播放的镜头计划，累计时长 ≥ 配音时长
 *
 * 算法（与 docs/cutmatrix/video-production-logic.md §9 一致）：
 *   for section in sections:
 *     candidates = pool.filter(stage_code == section.stageCode AND tags ⊇ requiredTags)
 *     accumulated = 0; chosen = []
 *     while accumulated < section.narrationDurationSec:
 *       seg = pop_random_unused(candidates)
 *       chosen.append(seg)
 *       accumulated += seg.durationSec
 *     if accumulated > section.narrationDurationSec:
 *       chosen[-1] 尾部截断到精确时长
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class CmParagraphAlignEngine {

    private final CmChapterGateway chapterGateway;
    private final CmVideoSegmentGateway segmentGateway;

    public CmComposeResultDTO align(CmParagraphAlignCmd cmd) {
        Set<String> globalUsed = new HashSet<>();
        List<CmComposeResultDTO.Clip> allClips = new ArrayList<>();
        BigDecimal totalDuration = BigDecimal.ZERO;

        for (CmParagraphAlignCmd.Section section : cmd.getSections()) {
            CmChapter chapter = chapterGateway.findByCollectionAndStage(cmd.getCollectionCode(), section.getStageCode());
            if (chapter == null) {
                log.warn("[ParagraphAlign] no chapter for collection={} stage={}", cmd.getCollectionCode(), section.getStageCode());
                continue;
            }
            List<CmVideoSegment> pool = segmentGateway.listByChapter(chapter.getChapterCode());
            if (pool.isEmpty()) {
                log.warn("[ParagraphAlign] empty segment pool for chapter={}", chapter.getChapterCode());
                continue;
            }
            // tag 过滤（required 全包含）
            List<CmVideoSegment> candidates = filterByRequiredTags(pool, section.getRequiredTags());
            if (candidates.isEmpty()) {
                log.warn("[ParagraphAlign] no candidate after tag filter, falling back to full pool. section={}", section.getSectionNo());
                candidates = pool;
            }

            BigDecimal target = BigDecimal.valueOf(section.getNarrationDurationSec());
            BigDecimal accumulated = BigDecimal.ZERO;
            int idx = 0;
            for (CmVideoSegment seg : candidates) {
                if (accumulated.compareTo(target) >= 0) break;
                if (globalUsed.contains(seg.getSegmentCode())) continue; // diversity: 跨段落不复用
                BigDecimal segDur = seg.getDurationSec() != null ? seg.getDurationSec() : BigDecimal.ZERO;
                if (segDur.signum() <= 0) continue;

                BigDecimal startSec = seg.getStartSec();
                BigDecimal endSec = seg.getEndSec();
                BigDecimal clipDur = segDur;

                BigDecimal nextAcc = accumulated.add(segDur);
                if (nextAcc.compareTo(target) > 0) {
                    // 尾部截断：本段镜头只取 (target - accumulated) 长度
                    clipDur = target.subtract(accumulated);
                    endSec = startSec.add(clipDur);
                    nextAcc = target;
                }

                allClips.add(CmComposeResultDTO.Clip.builder()
                        .sectionNo(section.getSectionNo())
                        .stageCode(section.getStageCode())
                        .segmentCode(seg.getSegmentCode())
                        .videoUrl(seg.getVideoUrl())
                        .startSec(startSec)
                        .endSec(endSec)
                        .durationSec(clipDur.setScale(3, RoundingMode.HALF_UP))
                        .build());
                globalUsed.add(seg.getSegmentCode());
                accumulated = nextAcc;
                idx++;
            }
            totalDuration = totalDuration.add(accumulated);
            log.info("[ParagraphAlign] section={} stage={} target={}s actual={}s clips={}",
                    section.getSectionNo(), section.getStageCode(), target, accumulated, idx);
        }

        return CmComposeResultDTO.builder()
                .collectionCode(cmd.getCollectionCode())
                .mode("PARAGRAPH_ALIGN")
                .status("READY")
                .totalDurationSec(totalDuration.setScale(3, RoundingMode.HALF_UP))
                .clips(allClips)
                .build();
    }

    private List<CmVideoSegment> filterByRequiredTags(List<CmVideoSegment> pool, List<String> requiredTags) {
        if (requiredTags == null || requiredTags.isEmpty()) return pool;
        List<CmVideoSegment> out = new ArrayList<>();
        for (CmVideoSegment seg : pool) {
            String haystack = String.join(" ",
                    seg.getSceneTags() == null ? "" : seg.getSceneTags(),
                    seg.getSellingPointTags() == null ? "" : seg.getSellingPointTags(),
                    seg.getCaption() == null ? "" : seg.getCaption(),
                    seg.getHookType() == null ? "" : seg.getHookType()).toLowerCase();
            boolean allHit = true;
            for (String t : requiredTags) {
                if (!haystack.contains(t.toLowerCase())) { allHit = false; break; }
            }
            if (allHit) out.add(seg);
        }
        return out;
    }
}
