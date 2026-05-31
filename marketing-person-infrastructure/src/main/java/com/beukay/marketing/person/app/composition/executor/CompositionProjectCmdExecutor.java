package com.beukay.marketing.person.app.composition.executor;

import com.beukay.marketing.person.app.composition.convertor.CompositionDTOConvertor;
import com.beukay.marketing.person.client.composition.cmd.ImportChaptersCmd;
import com.beukay.marketing.person.client.composition.cmd.SaveChaptersCmd;
import com.beukay.marketing.person.client.composition.cmd.UpsertCompositionProjectCmd;
import com.beukay.marketing.person.client.composition.dto.CompositionProjectDTO;
import com.beukay.marketing.person.client.composition.enums.ChapterAudioMode;
import com.beukay.marketing.person.client.composition.enums.ChapterSource;
import com.beukay.marketing.person.client.composition.enums.CompositionMode;
import com.beukay.marketing.person.client.composition.enums.MaterialCategory;
import com.beukay.marketing.person.client.composition.enums.OverflowTrimStrategy;
import com.beukay.marketing.person.domain.composition.ability.CompositionProjectService;
import com.beukay.marketing.person.domain.composition.ability.MaterialTagService;
import com.beukay.marketing.person.domain.composition.model.CompositionChapter;
import com.beukay.marketing.person.domain.composition.model.CompositionProject;
import com.beukay.marketing.person.domain.composition.model.MaterialTag;
import com.beukay.marketing.person.domain.composition.gateway.MaterialTagGateway;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Log4j2
public class CompositionProjectCmdExecutor {

    private final CompositionProjectService projectService;
    private final MaterialTagService materialTagService;     // for service abstraction (currently unused, kept for symmetry)
    private final MaterialTagGateway materialTagGateway;     // direct lookup for chapter tag attach

    public CompositionProjectDTO create(UpsertCompositionProjectCmd cmd) {
        CompositionProject saved = projectService.create(buildEntity(cmd));
        // 诸葛亮 + CATEGORY 子模式：自动按 9 个 MaterialCategory 顺序生成 9 个章节
        // FOLDER 子模式留空，由前端"解析章节目录"步骤上传文件夹后通过 /import-chapters 写入
        boolean isZhuGeLiang = CompositionMode.ZHU_GE_LIANG.name().equals(saved.getMode());
        boolean isCategorySource = saved.getChapterSource() == null
                || ChapterSource.CATEGORY.name().equals(saved.getChapterSource());
        if (isZhuGeLiang && isCategorySource) {
            List<CompositionChapter> defaults = buildDefaultZhuGeLiangChapters(saved.getId());
            projectService.saveChapters(saved.getId(), defaults);
            saved = projectService.getDetail(saved.getId());
        }
        return CompositionDTOConvertor.INSTANCE.toProjectDTO(saved);
    }

    private List<CompositionChapter> buildDefaultZhuGeLiangChapters(Long projectId) {
        MaterialCategory[] categories = MaterialCategory.values();
        List<CompositionChapter> list = new ArrayList<>(categories.length);
        for (int i = 0; i < categories.length; i++) {
            MaterialCategory cat = categories[i];
            list.add(CompositionChapter.builder()
                    .projectId(projectId)
                    .sortNo(i + 1)
                    .name((i + 1) + " " + cat.getLabel())
                    .category(cat.name())
                    .audioMode(ChapterAudioMode.NO_VO_FIXED_COUNT.name())
                    .fixedClipCount(1)
                    .allowVoiceoverReuse(false)
                    .stripOriginalAudio(false) // 默认保留素材原声
                    .overflowTrim(OverflowTrimStrategy.TRIM_TAIL.name()) // NOT NULL 列
                    .repeatRate(0.0)
                    .build());
        }
        return list;
    }

    public CompositionProjectDTO update(Long id, UpsertCompositionProjectCmd cmd) {
        cmd.setId(id);
        CompositionProject saved = projectService.update(buildEntity(cmd));
        return CompositionDTOConvertor.INSTANCE.toProjectDTO(saved);
    }

    public void delete(Long id) {
        projectService.delete(id);
    }

    /**
     * FOLDER 模式：从浏览器端解析的目录结构构造章节（全量替换）。
     * 每个 ChapterInput 对应一个子目录：
     *   - 有 voiceoverId  → audioMode = FILL_CLIPS_FOR_VO（按配音时长自动填画面）
     *   - 无 voiceoverId  → audioMode = NO_VO_FIXED_COUNT（无配音，按素材数固定输出）
     */
    public CompositionProjectDTO importChapters(Long projectId, ImportChaptersCmd cmd) {
        List<CompositionChapter> entities = new ArrayList<>(cmd.getChapters().size());
        for (ImportChaptersCmd.ChapterInput in : cmd.getChapters()) {
            // 多配音池：voiceoverIds 优先，回退到 voiceoverId 单值
            List<Long> voiceoverIds = in.getVoiceoverIds() == null ? List.of() : in.getVoiceoverIds();
            Long primaryVoId = !voiceoverIds.isEmpty() ? voiceoverIds.get(0) : in.getVoiceoverId();
            boolean hasVoiceover = primaryVoId != null;
            String audioMode = hasVoiceover
                    ? ChapterAudioMode.FILL_CLIPS_FOR_VO.name()
                    : ChapterAudioMode.NO_VO_FIXED_COUNT.name();
            int fixedCount = in.getFixedClipCount() != null
                    ? in.getFixedClipCount()
                    : in.getMaterialClipIds().size();
            String chapterName = (in.getName() == null || in.getName().isBlank())
                    ? in.getSourceFolderName()
                    : in.getName();
            CompositionChapter ch = CompositionChapter.builder()
                    .projectId(projectId)
                    .sortNo(in.getSortNo())
                    .name(chapterName)
                    .audioMode(audioMode)
                    .voiceoverId(primaryVoId)
                    .voiceoverIds(voiceoverIds)
                    .fixedClipCount(fixedCount)
                    .allowVoiceoverReuse(false)
                    .stripOriginalAudio(hasVoiceover)
                    .overflowTrim(OverflowTrimStrategy.TRIM_TAIL.name())
                    .repeatRate(0.0)
                    .materialClipIds(in.getMaterialClipIds())
                    .sourceFolderName(in.getSourceFolderName())
                    .transitionEnabled(false)
                    .build();
            entities.add(ch);
        }
        projectService.saveChapters(projectId, entities);
        // BGM 库一并写到项目（仅在请求带了相关字段时更新，避免清掉已配置）
        CompositionProject project = projectService.getDetail(projectId);
        boolean bgmDirty = false;
        if (cmd.getBgmVoiceoverIds() != null) {
            project.setBgmVoiceoverIds(cmd.getBgmVoiceoverIds());
            bgmDirty = true;
        }
        if (cmd.getBgmLoopMode() != null) {
            project.setBgmLoopMode(cmd.getBgmLoopMode());
            bgmDirty = true;
        }
        if (cmd.getBgmVolume() != null) {
            project.setBgmVolume(cmd.getBgmVolume());
            bgmDirty = true;
        }
        if (cmd.getBgmStartChapter() != null) {
            project.setBgmStartChapter(cmd.getBgmStartChapter());
            bgmDirty = true;
        }
        if (bgmDirty) {
            project = projectService.update(project);
            project.setChapters(projectService.getDetail(projectId).getChapters());
        }
        return CompositionDTOConvertor.INSTANCE.toProjectDTO(project);
    }

    public CompositionProjectDTO saveChapters(Long projectId, SaveChaptersCmd cmd) {
        List<CompositionChapter> entities = new ArrayList<>(cmd.getChapters().size());
        for (int i = 0; i < cmd.getChapters().size(); i++) {
            SaveChaptersCmd.ChapterInput in = cmd.getChapters().get(i);
            CompositionChapter ch = CompositionChapter.builder()
                    .id(in.getId())
                    .projectId(projectId)
                    .sortNo(in.getSortNo() == null ? i : in.getSortNo())
                    .name(in.getName())
                    .category(in.getCategory())
                    .audioMode(in.getAudioMode())
                    .voiceoverId(in.getVoiceoverId())
                    .voiceoverIds(in.getVoiceoverIds() == null ? List.of() : in.getVoiceoverIds())
                    .fixedClipCount(in.getFixedClipCount())
                    .minDurationMs(in.getMinDurationMs())
                    .allowVoiceoverReuse(in.getAllowVoiceoverReuse() != null && in.getAllowVoiceoverReuse())
                    .stripOriginalAudio(in.getStripOriginalAudio() == null || in.getStripOriginalAudio())
                    .overflowTrim(in.getOverflowTrim())
                    .lengthAdjustMode(in.getLengthAdjustMode())
                    .audioReuseMode(in.getAudioReuseMode())
                    .loopStrategy(in.getLoopStrategy())
                    .loopRounds(in.getLoopRounds())
                    .repeatRate(in.getRepeatRate() == null ? 0.0 : in.getRepeatRate())
                    .tagFilter(loadTags(in.getTagFilterIds()))
                    .materialClipIds(in.getMaterialClipIds() == null ? List.of() : in.getMaterialClipIds())
                    .sourceFolderName(in.getSourceFolderName())
                    .transitionEnabled(in.getTransitionEnabled() != null && in.getTransitionEnabled())
                    .build();
            entities.add(ch);
        }
        projectService.saveChapters(projectId, entities);
        // 返回最新 detail
        CompositionProject detail = projectService.getDetail(projectId);
        return CompositionDTOConvertor.INSTANCE.toProjectDTO(detail);
    }

    private CompositionProject buildEntity(UpsertCompositionProjectCmd cmd) {
        String chapterSource = cmd.getChapterSource();
        if (chapterSource == null || chapterSource.isBlank()) {
            chapterSource = ChapterSource.CATEGORY.name();
        }
        return CompositionProject.builder()
                .id(cmd.getId())
                .name(cmd.getName())
                .description(cmd.getDescription())
                .mode(cmd.getMode())
                .chapterSource(chapterSource)
                .combinationStrategy(cmd.getCombinationStrategy())
                .targetCount(cmd.getTargetCount())
                .globalBgmVoiceoverId(cmd.getGlobalBgmVoiceoverId())
                .bgmVoiceoverIds(cmd.getBgmVoiceoverIds())
                .bgmLoopMode(cmd.getBgmLoopMode())
                .bgmVolume(cmd.getBgmVolume())
                .bgmStartChapter(cmd.getBgmStartChapter())
                .outputWidth(cmd.getOutputWidth())
                .outputHeight(cmd.getOutputHeight())
                .outputFps(cmd.getOutputFps())
                .status(cmd.getStatus())
                .build();
    }

    private List<MaterialTag> loadTags(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return materialTagGateway.findByIds(ids);
    }
}
