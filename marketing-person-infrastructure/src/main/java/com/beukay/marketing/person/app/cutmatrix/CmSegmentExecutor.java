package com.beukay.marketing.person.app.cutmatrix;

import com.beukay.ai.common.entity.BaseFields;
import com.beukay.marketing.person.client.cmd.CmSegmentImportCmd;
import com.beukay.marketing.person.client.dto.CmChapterDTO;
import com.beukay.marketing.person.client.dto.CmVideoSegmentDTO;
import com.beukay.marketing.person.domain.cutmatrix.chapter.gateway.CmChapterGateway;
import com.beukay.marketing.person.domain.cutmatrix.chapter.model.CmChapter;
import com.beukay.marketing.person.domain.cutmatrix.segment.gateway.CmVideoSegmentGateway;
import com.beukay.marketing.person.domain.cutmatrix.segment.model.CmVideoSegment;
import com.beukay.marketing.person.domain.videoDeconstructionResult.gateway.VideoDeconstructionResultGateway;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.beukay.marketing.person.domain.videoSegment.gateway.VideoSegmentGateway;
import com.beukay.marketing.person.domain.videoSegment.model.VideoSegment;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 入口 B：从拆解结果导入素材到 cm_video_segment.
 * 自动按 stage_code 归章节：HOOK / SCENE / BENEFIT / PROOF_CTA / UNTAGGED.
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class CmSegmentExecutor {

    private final CmChapterGateway chapterGateway;
    private final CmVideoSegmentGateway segmentGateway;
    private final VideoDeconstructionResultGateway deconResultGateway;
    private final VideoSegmentGateway videoSegmentGateway;

    @Transactional(rollbackFor = Exception.class)
    public Integer importFromDeconstruction(CmSegmentImportCmd cmd) {
        int total = 0;
        List<CmVideoSegment> toSave = new ArrayList<>();
        for (String idStr : cmd.getDeconstructionIds()) {
            Long id;
            try { id = Long.parseLong(idStr); }
            catch (NumberFormatException e) { log.warn("[Import] invalid id={}", idStr); continue; }
            VideoDeconstructionResult decon = deconResultGateway.queryById(id);
            if (decon == null) { log.warn("[Import] decon not found id={}", id); continue; }
            List<VideoSegment> segments = videoSegmentGateway.listByVideoId(decon.getVideoId());
            for (VideoSegment seg : segments) {
                if (seg.getEndSec() <= seg.getStartSec()) continue;
                String stage = inferStage(seg.getStructureTag());
                CmChapter chapter = ensureChapter(cmd.getCollectionCode(), stage);
                BigDecimal startSec = BigDecimal.valueOf(seg.getStartSec());
                BigDecimal endSec = BigDecimal.valueOf(seg.getEndSec());
                BigDecimal durationSec = endSec.subtract(startSec);

                CmVideoSegment cmSeg = CmVideoSegment.builder()
                        .segmentCode("cms-" + UUID.randomUUID().toString().replace("-", "").substring(0, 24))
                        .collectionCode(cmd.getCollectionCode())
                        .chapterCode(chapter.getChapterCode())
                        .videoUrl(streamUrl(decon.getVideoId()))
                        .startSec(startSec)
                        .endSec(endSec)
                        .durationSec(durationSec)
                        .noMirror(0)
                        .orderNo(seg.getSegmentIndex())
                        .stageCode(stage)
                        .sceneTags(toJsonArray(seg.getScene()))
                        .sellingPointTags(toJsonArray(seg.getSellingPoint()))
                        .hookType(decon.getHookType())
                        .caption(seg.getStructureTag())
                        .sourceType("DECONSTRUCTION")
                        .sourceSegmentId(seg.getId() == null ? null : String.valueOf(seg.getId()))
                        .sourceVideoId(decon.getVideoId())
                        .baseFields(newBaseFields())
                        .build();
                toSave.add(cmSeg);
                total++;
            }
        }
        if (!toSave.isEmpty()) segmentGateway.batchSave(toSave);
        log.info("[CmSegmentImport] collection={} imported={} segments", cmd.getCollectionCode(), total);
        return total;
    }

    public List<CmChapterDTO> listChapters(String collectionCode) {
        return chapterGateway.listByCollection(collectionCode).stream()
                .map(c -> CmChapterDTO.builder()
                        .id(c.getId())
                        .chapterCode(c.getChapterCode())
                        .collectionCode(c.getCollectionCode())
                        .name(c.getName())
                        .stageCode(c.getStageCode())
                        .orderNo(c.getOrderNo())
                        .voiceClipUrl(c.getVoiceClipUrl())
                        .segmentCount(segmentGateway.listByChapter(c.getChapterCode()).size())
                        .build()).toList();
    }

    public List<CmVideoSegmentDTO> listSegments(String collectionCode, String chapterCode) {
        List<CmVideoSegment> list = (chapterCode == null || chapterCode.isBlank())
                ? segmentGateway.listByCollection(collectionCode)
                : segmentGateway.listByChapter(chapterCode);
        return list.stream().map(s -> CmVideoSegmentDTO.builder()
                .id(s.getId())
                .segmentCode(s.getSegmentCode())
                .collectionCode(s.getCollectionCode())
                .chapterCode(s.getChapterCode())
                .videoUrl(s.getVideoUrl())
                .startSec(s.getStartSec())
                .endSec(s.getEndSec())
                .durationSec(s.getDurationSec())
                .noMirror(s.getNoMirror())
                .orderNo(s.getOrderNo())
                .stageCode(s.getStageCode())
                .sceneTags(s.getSceneTags())
                .sellingPointTags(s.getSellingPointTags())
                .hookType(s.getHookType())
                .caption(s.getCaption())
                .sourceType(s.getSourceType())
                .sourceSegmentId(s.getSourceSegmentId())
                .sourceVideoId(s.getSourceVideoId())
                .build()).toList();
    }

    private CmChapter ensureChapter(String collectionCode, String stageCode) {
        CmChapter existing = chapterGateway.findByCollectionAndStage(collectionCode, stageCode);
        if (existing != null) return existing;
        int order = switch (stageCode) {
            case "HOOK" -> 1;
            case "SCENE" -> 2;
            case "BENEFIT" -> 3;
            case "PROOF_CTA" -> 4;
            default -> 99;
        };
        String name = switch (stageCode) {
            case "HOOK" -> "01_钩子";
            case "SCENE" -> "02_场景痛点";
            case "BENEFIT" -> "03_方案卖点";
            case "PROOF_CTA" -> "04_证明收束";
            default -> "99_待分类";
        };
        CmChapter chapter = CmChapter.builder()
                .chapterCode("cmh-" + UUID.randomUUID().toString().replace("-", "").substring(0, 24))
                .collectionCode(collectionCode)
                .name(name)
                .stageCode(stageCode)
                .orderNo(order)
                .baseFields(newBaseFields())
                .build();
        chapterGateway.save(chapter);
        return chapter;
    }

    private String inferStage(String tag) {
        if (tag == null) return "UNTAGGED";
        String t = tag.toLowerCase();
        if (t.contains("钩子") || t.contains("hook")) return "HOOK";
        if (t.contains("场景") || t.contains("痛点") || t.contains("scene")) return "SCENE";
        if (t.contains("卖点") || t.contains("benefit") || t.contains("方案") || t.contains("演绎")) return "BENEFIT";
        if (t.contains("证明") || t.contains("cta") || t.contains("proof") || t.contains("收束")) return "PROOF_CTA";
        return "UNTAGGED";
    }

    private String toJsonArray(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String trimmed = raw.trim();
        if (trimmed.startsWith("[") || trimmed.startsWith("{")) return trimmed;
        // 拆成逗号分隔单元 → JSON 字符串数组
        String[] parts = trimmed.split("[,，]");
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        for (String p : parts) {
            String t = p.trim();
            if (t.isEmpty()) continue;
            if (!first) sb.append(',');
            sb.append('"').append(t.replace("\\", "\\\\").replace("\"", "\\\"")).append('"');
            first = false;
        }
        sb.append(']');
        return sb.length() == 2 ? null : sb.toString();
    }

    private String streamUrl(String videoId) {
        if (videoId == null) return null;
        if (videoId.startsWith("http://") || videoId.startsWith("https://")) return videoId;
        return "/videoUnderstanding/stream/" + videoId;
    }

    private BaseFields newBaseFields() {
        return BaseFields.builder()
                .isDeleted(false)
                .nezhaTenantCode("")
                .createBy(0L).createName("")
                .updateBy(0L).updateName("")
                .createAt(LocalDateTime.now())
                .updateAt(LocalDateTime.now())
                .build();
    }
}
