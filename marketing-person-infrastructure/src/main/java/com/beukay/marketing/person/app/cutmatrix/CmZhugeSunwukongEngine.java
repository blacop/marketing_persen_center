package com.beukay.marketing.person.app.cutmatrix;

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
import java.util.Collections;
import java.util.List;
import java.util.Random;

/**
 * 孙悟空 / 诸葛亮 模式编排引擎（与段落对齐 Engine 平行）。
 *
 * 孙悟空：根据 narrationDurationSec（来自配音文件长度），从所有章节里随机抽取镜头填充
 * 诸葛亮：按章节顺序，每章节内随机抽取镜头填到 targetSecPerChapter
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class CmZhugeSunwukongEngine {

    private final CmChapterGateway chapterGateway;
    private final CmVideoSegmentGateway segmentGateway;

    /** 孙悟空：整段配音 + 全章节随机镜头填充 */
    public CmComposeResultDTO sunwukong(String collectionCode, double totalDurationSec, long seed) {
        List<CmChapter> chapters = chapterGateway.listByCollection(collectionCode);
        List<CmVideoSegment> pool = new ArrayList<>();
        for (CmChapter ch : chapters) pool.addAll(segmentGateway.listByChapter(ch.getChapterCode()));
        if (pool.isEmpty()) {
            return failure(collectionCode, "SUNWUKONG", "no segments in collection");
        }
        Random rng = new Random(seed);
        Collections.shuffle(pool, rng);

        List<CmComposeResultDTO.Clip> clips = new ArrayList<>();
        BigDecimal target = BigDecimal.valueOf(totalDurationSec);
        BigDecimal accumulated = BigDecimal.ZERO;
        int sectionNo = 1;
        for (CmVideoSegment seg : pool) {
            if (accumulated.compareTo(target) >= 0) break;
            BigDecimal dur = seg.getDurationSec() == null ? BigDecimal.ZERO : seg.getDurationSec();
            if (dur.signum() <= 0) continue;
            BigDecimal next = accumulated.add(dur);
            BigDecimal startSec = seg.getStartSec();
            BigDecimal endSec = seg.getEndSec();
            BigDecimal clipDur = dur;
            if (next.compareTo(target) > 0) {
                clipDur = target.subtract(accumulated);
                endSec = startSec.add(clipDur);
                next = target;
            }
            clips.add(CmComposeResultDTO.Clip.builder()
                    .sectionNo(sectionNo++)
                    .stageCode(seg.getStageCode() == null ? "ALL" : seg.getStageCode())
                    .segmentCode(seg.getSegmentCode())
                    .videoUrl(seg.getVideoUrl())
                    .startSec(startSec)
                    .endSec(endSec)
                    .durationSec(clipDur.setScale(3, RoundingMode.HALF_UP))
                    .build());
            accumulated = next;
        }

        log.info("[Sunwukong] coll={} target={}s actual={}s clips={}", collectionCode, target, accumulated, clips.size());
        return CmComposeResultDTO.builder()
                .collectionCode(collectionCode)
                .mode("SUNWUKONG")
                .status("READY")
                .totalDurationSec(accumulated.setScale(3, RoundingMode.HALF_UP))
                .clips(clips)
                .build();
    }

    /** 诸葛亮：每章节独立配音 + 每章节内随机镜头填充 */
    public CmComposeResultDTO zhuge(String collectionCode, double secPerChapter, long seed) {
        List<CmChapter> chapters = chapterGateway.listByCollection(collectionCode);
        if (chapters.isEmpty()) {
            return failure(collectionCode, "ZHUGE", "no chapters in collection");
        }
        Random rng = new Random(seed);
        BigDecimal target = BigDecimal.valueOf(secPerChapter);
        List<CmComposeResultDTO.Clip> allClips = new ArrayList<>();
        BigDecimal totalDur = BigDecimal.ZERO;
        for (CmChapter ch : chapters) {
            List<CmVideoSegment> pool = new ArrayList<>(segmentGateway.listByChapter(ch.getChapterCode()));
            if (pool.isEmpty()) continue;
            Collections.shuffle(pool, rng);
            BigDecimal accumulated = BigDecimal.ZERO;
            for (CmVideoSegment seg : pool) {
                if (accumulated.compareTo(target) >= 0) break;
                BigDecimal dur = seg.getDurationSec() == null ? BigDecimal.ZERO : seg.getDurationSec();
                if (dur.signum() <= 0) continue;
                BigDecimal next = accumulated.add(dur);
                BigDecimal startSec = seg.getStartSec();
                BigDecimal endSec = seg.getEndSec();
                BigDecimal clipDur = dur;
                if (next.compareTo(target) > 0) {
                    clipDur = target.subtract(accumulated);
                    endSec = startSec.add(clipDur);
                    next = target;
                }
                allClips.add(CmComposeResultDTO.Clip.builder()
                        .sectionNo(ch.getOrderNo())
                        .stageCode(ch.getStageCode())
                        .segmentCode(seg.getSegmentCode())
                        .videoUrl(seg.getVideoUrl())
                        .startSec(startSec)
                        .endSec(endSec)
                        .durationSec(clipDur.setScale(3, RoundingMode.HALF_UP))
                        .build());
                accumulated = next;
            }
            totalDur = totalDur.add(accumulated);
        }
        log.info("[Zhuge] coll={} chapters={} totalDur={}s clips={}", collectionCode, chapters.size(), totalDur, allClips.size());
        return CmComposeResultDTO.builder()
                .collectionCode(collectionCode)
                .mode("ZHUGE")
                .status("READY")
                .totalDurationSec(totalDur.setScale(3, RoundingMode.HALF_UP))
                .clips(allClips)
                .build();
    }

    private CmComposeResultDTO failure(String coll, String mode, String msg) {
        return CmComposeResultDTO.builder()
                .collectionCode(coll).mode(mode).status("FAILED").errorMsg(msg)
                .totalDurationSec(BigDecimal.ZERO).clips(List.of())
                .build();
    }
}
