package com.beukay.marketing.person.app.composition.convertor;

import com.beukay.ai.common.entity.BaseFields;
import com.beukay.marketing.person.client.composition.dto.CompositionChapterDTO;
import com.beukay.marketing.person.client.composition.dto.CompositionPlanPreviewDTO;
import com.beukay.marketing.person.client.composition.dto.CompositionProjectDTO;
import com.beukay.marketing.person.client.composition.dto.MaterialClipDTO;
import com.beukay.marketing.person.client.composition.dto.MaterialTagDTO;
import com.beukay.marketing.person.client.composition.dto.RenderConfigDTO;
import com.beukay.marketing.person.client.composition.dto.RenderJobDTO;
import com.beukay.marketing.person.client.composition.dto.RenderOutputDTO;
import com.beukay.marketing.person.client.composition.dto.SourceVideoDTO;
import com.beukay.marketing.person.client.composition.dto.VoiceoverAssetDTO;
import com.beukay.marketing.person.domain.composition.model.ChapterPlan;
import com.beukay.marketing.person.domain.composition.model.ClipPick;
import com.beukay.marketing.person.domain.composition.model.CompositionChapter;
import com.beukay.marketing.person.domain.composition.model.CompositionPlan;
import com.beukay.marketing.person.domain.composition.model.CompositionProject;
import com.beukay.marketing.person.domain.composition.model.MaterialClip;
import com.beukay.marketing.person.domain.composition.model.MaterialTag;
import com.beukay.marketing.person.domain.composition.model.RenderConfig;
import com.beukay.marketing.person.domain.composition.model.RenderJob;
import com.beukay.marketing.person.domain.composition.model.RenderOutput;
import com.beukay.marketing.person.domain.composition.model.SourceVideo;
import com.beukay.marketing.person.domain.composition.model.VoiceoverAsset;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;
import java.util.List;

/** Domain → DTO 转换 */
@Mapper
public interface CompositionDTOConvertor {

    CompositionDTOConvertor INSTANCE = Mappers.getMapper(CompositionDTOConvertor.class);

    default MaterialTagDTO toTagDTO(MaterialTag entity) {
        if (entity == null) {
            return null;
        }
        return MaterialTagDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .category(entity.getCategory())
                .color(entity.getColor())
                .description(entity.getDescription())
                .build();
    }

    default List<MaterialTagDTO> toTagDTOList(List<MaterialTag> entities) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream().map(this::toTagDTO).toList();
    }

    default MaterialClipDTO toMaterialClipDTO(MaterialClip entity) {
        if (entity == null) {
            return null;
        }
        BaseFields bf = entity.getBaseFields();
        LocalDateTime createAt = bf == null ? null : bf.getCreateAt();
        LocalDateTime updateAt = bf == null ? null : bf.getUpdateAt();
        return MaterialClipDTO.builder()
                .id(entity.getId())
                .ossKey(entity.getOssKey())
                .kind(entity.getKind())
                .originalName(entity.getOriginalName())
                .durationMs(entity.getDurationMs())
                .width(entity.getWidth())
                .height(entity.getHeight())
                .fps(entity.getFps())
                .bitrate(entity.getBitrate())
                .fileSize(entity.getFileSize())
                .sha256(entity.getSha256())
                .sourceType(entity.getSourceType())
                .sourceExtra(entity.getSourceExtra())
                .category(entity.getCategory())
                .tags(toTagDTOList(entity.getTags()))
                .createAt(createAt)
                .updateAt(updateAt)
                .build();
    }

    default List<MaterialClipDTO> toMaterialClipDTOList(List<MaterialClip> entities) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream().map(this::toMaterialClipDTO).toList();
    }

    default VoiceoverAssetDTO toVoiceoverDTO(VoiceoverAsset entity) {
        if (entity == null) {
            return null;
        }
        BaseFields bf = entity.getBaseFields();
        LocalDateTime createAt = bf == null ? null : bf.getCreateAt();
        LocalDateTime updateAt = bf == null ? null : bf.getUpdateAt();
        return VoiceoverAssetDTO.builder()
                .id(entity.getId())
                .ossKey(entity.getOssKey())
                .source(entity.getSource())
                .textContent(entity.getTextContent())
                .voiceCode(entity.getVoiceCode())
                .speed(entity.getSpeed())
                .durationMs(entity.getDurationMs())
                .fileSize(entity.getFileSize())
                .format(entity.getFormat())
                .category(entity.getCategory())
                .createAt(createAt)
                .updateAt(updateAt)
                .build();
    }

    default List<VoiceoverAssetDTO> toVoiceoverDTOList(List<VoiceoverAsset> entities) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream().map(this::toVoiceoverDTO).toList();
    }

    // ── SourceVideo（视频拆解） ────────────────────────────────────────

    default SourceVideoDTO toSourceVideoDTO(SourceVideo entity) {
        if (entity == null) return null;
        BaseFields bf = entity.getBaseFields();
        LocalDateTime createAt = bf == null ? null : bf.getCreateAt();
        LocalDateTime updateAt = bf == null ? null : bf.getUpdateAt();
        List<SourceVideoDTO.SegmentDTO> segs = entity.getSegments() == null ? List.of()
                : entity.getSegments().stream().map(s -> SourceVideoDTO.SegmentDTO.builder()
                        .startMs(s.getStartMs()).endMs(s.getEndMs())
                        .category(s.getCategory()).name(s.getName()).memo(s.getMemo())
                        .materialClipId(s.getMaterialClipId()).build()).toList();
        return SourceVideoDTO.builder()
                .id(entity.getId())
                .ossKey(entity.getOssKey())
                .originalName(entity.getOriginalName())
                .durationMs(entity.getDurationMs())
                .fileSize(entity.getFileSize())
                .width(entity.getWidth())
                .height(entity.getHeight())
                .segments(segs)
                .status(entity.getStatus())
                .createAt(createAt)
                .updateAt(updateAt)
                .build();
    }

    default List<SourceVideoDTO> toSourceVideoDTOList(List<SourceVideo> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::toSourceVideoDTO).toList();
    }

    // ── Project / Chapter ────────────────────────────────────────────

    default CompositionChapterDTO toChapterDTO(CompositionChapter entity) {
        if (entity == null) return null;
        List<MaterialTagDTO> tagDTOs = toTagDTOList(entity.getTagFilter());
        List<Long> tagIds = tagDTOs.stream().map(MaterialTagDTO::getId).toList();
        return CompositionChapterDTO.builder()
                .id(entity.getId())
                .projectId(entity.getProjectId())
                .sortNo(entity.getSortNo())
                .name(entity.getName())
                .category(entity.getCategory())
                .audioMode(entity.getAudioMode())
                .voiceoverId(entity.getVoiceoverId())
                .voiceoverIds(entity.getVoiceoverIds() == null ? List.of() : entity.getVoiceoverIds())
                .fixedClipCount(entity.getFixedClipCount())
                .minDurationMs(entity.getMinDurationMs())
                .allowVoiceoverReuse(entity.getAllowVoiceoverReuse())
                .stripOriginalAudio(entity.getStripOriginalAudio())
                .overflowTrim(entity.getOverflowTrim())
                .lengthAdjustMode(entity.getLengthAdjustMode())
                .audioReuseMode(entity.getAudioReuseMode())
                .loopStrategy(entity.getLoopStrategy())
                .loopRounds(entity.getLoopRounds())
                .repeatRate(entity.getRepeatRate())
                .tagFilterIds(tagIds)
                .tagFilter(tagDTOs)
                .materialClipIds(entity.getMaterialClipIds() == null ? List.of() : entity.getMaterialClipIds())
                .sourceFolderName(entity.getSourceFolderName())
                .transitionEnabled(entity.getTransitionEnabled())
                .build();
    }

    default List<CompositionChapterDTO> toChapterDTOList(List<CompositionChapter> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::toChapterDTO).toList();
    }

    default CompositionProjectDTO toProjectDTO(CompositionProject entity) {
        if (entity == null) return null;
        BaseFields bf = entity.getBaseFields();
        return CompositionProjectDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .mode(entity.getMode())
                .chapterSource(entity.getChapterSource())
                .combinationStrategy(entity.getCombinationStrategy())
                .targetCount(entity.getTargetCount())
                .globalBgmVoiceoverId(entity.getGlobalBgmVoiceoverId())
                .bgmVoiceoverIds(entity.getBgmVoiceoverIds() == null ? List.of() : entity.getBgmVoiceoverIds())
                .bgmLoopMode(entity.getBgmLoopMode())
                .bgmVolume(entity.getBgmVolume())
                .bgmStartChapter(entity.getBgmStartChapter())
                .outputWidth(entity.getOutputWidth())
                .outputHeight(entity.getOutputHeight())
                .outputFps(entity.getOutputFps())
                .status(entity.getStatus())
                .chapters(toChapterDTOList(entity.getChapters()))
                .createAt(bf == null ? null : bf.getCreateAt())
                .updateAt(bf == null ? null : bf.getUpdateAt())
                .build();
    }

    default List<CompositionProjectDTO> toProjectDTOList(List<CompositionProject> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::toProjectDTO).toList();
    }

    // ── RenderJob / RenderOutput ─────────────────────────────────────

    default RenderJobDTO toRenderJobDTO(RenderJob entity) {
        if (entity == null) return null;
        BaseFields bf = entity.getBaseFields();
        return RenderJobDTO.builder()
                .id(entity.getId())
                .projectId(entity.getProjectId())
                .totalCount(entity.getTotalCount())
                .successCount(entity.getSuccessCount())
                .failedCount(entity.getFailedCount())
                .status(entity.getStatus())
                .progressPercent(entity.getProgressPercent())
                .currentStage(entity.getCurrentStage())
                .errorMsg(entity.getErrorMsg())
                .startedAt(entity.getStartedAt())
                .finishedAt(entity.getFinishedAt())
                .createAt(bf == null ? null : bf.getCreateAt())
                .renderConfig(toRenderConfigDTO(entity.getRenderConfig()))
                .build();
    }

    default RenderConfigDTO toRenderConfigDTO(RenderConfig c) {
        if (c == null) return null;
        return RenderConfigDTO.builder()
                .aspectRatio(c.getAspectRatio())
                .resolution(c.getResolution())
                .fps(c.getFps())
                .container(c.getContainer())
                .codec(c.getCodec())
                .mirrorProb(c.getMirrorProb())
                .trimMin(c.getTrimMin())
                .trimMax(c.getTrimMax())
                .exportType(c.getExportType())
                .exportPath(c.getExportPath())
                .build();
    }

    default RenderConfig toRenderConfig(RenderConfigDTO dto) {
        if (dto == null) return null;
        return RenderConfig.builder()
                .aspectRatio(dto.getAspectRatio())
                .resolution(dto.getResolution())
                .fps(dto.getFps())
                .container(dto.getContainer())
                .codec(dto.getCodec())
                .mirrorProb(dto.getMirrorProb())
                .trimMin(dto.getTrimMin())
                .trimMax(dto.getTrimMax())
                .exportType(dto.getExportType())
                .exportPath(dto.getExportPath())
                .build();
    }

    default List<RenderJobDTO> toRenderJobDTOList(List<RenderJob> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::toRenderJobDTO).toList();
    }

    default RenderOutputDTO toRenderOutputDTO(RenderOutput entity) {
        if (entity == null) return null;
        BaseFields bf = entity.getBaseFields();
        return RenderOutputDTO.builder()
                .id(entity.getId())
                .jobId(entity.getJobId())
                .projectId(entity.getProjectId())
                .planHash(entity.getPlanHash())
                .planSnapshot(entity.getPlanSnapshot())
                .ossKey(entity.getOssKey())
                .durationMs(entity.getDurationMs())
                .width(entity.getWidth())
                .height(entity.getHeight())
                .fileSize(entity.getFileSize())
                .status(entity.getStatus())
                .errorMsg(entity.getErrorMsg())
                .startedAt(entity.getStartedAt())
                .finishedAt(entity.getFinishedAt())
                .createAt(bf == null ? null : bf.getCreateAt())
                .build();
    }

    default List<RenderOutputDTO> toRenderOutputDTOList(List<RenderOutput> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::toRenderOutputDTO).toList();
    }

    // ── Plan preview ─────────────────────────────────────────────────

    default CompositionPlanPreviewDTO.ClipPickDTO toClipPickDTO(ClipPick p) {
        if (p == null) return null;
        return CompositionPlanPreviewDTO.ClipPickDTO.builder()
                .clipId(p.getClipId())
                .originalName(p.getOriginalName())
                .startMs(p.getStartMs())
                .endMs(p.getEndMs())
                .takenDurationMs(p.getTakenDurationMs())
                .trimmed(p.getTrimmed())
                .build();
    }

    default CompositionPlanPreviewDTO.ChapterPick toChapterPickDTO(ChapterPlan ch) {
        if (ch == null) return null;
        return CompositionPlanPreviewDTO.ChapterPick.builder()
                .chapterId(ch.getChapterId())
                .chapterName(ch.getChapterName())
                .audioMode(ch.getAudioMode())
                .voiceoverId(ch.getVoiceoverId())
                .picks(ch.getPicks() == null ? List.of() :
                        ch.getPicks().stream().map(this::toClipPickDTO).toList())
                .build();
    }

    default CompositionPlanPreviewDTO.Plan toPlanDTO(CompositionPlan p) {
        if (p == null) return null;
        return CompositionPlanPreviewDTO.Plan.builder()
                .planHash(p.getPlanHash())
                .estimatedDurationMs(p.getEstimatedDurationMs())
                .chapters(p.getChapters() == null ? List.of() :
                        p.getChapters().stream().map(this::toChapterPickDTO).toList())
                .build();
    }

    default CompositionPlanPreviewDTO toPlanPreviewDTO(int requested, List<CompositionPlan> plans) {
        return CompositionPlanPreviewDTO.builder()
                .requestedCount(requested)
                .generatedCount(plans == null ? 0 : plans.size())
                .plans(plans == null ? List.of() :
                        plans.stream().map(this::toPlanDTO).toList())
                .build();
    }
}
