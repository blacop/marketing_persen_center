package com.beukay.marketing.person.domain.composition.ability.impl;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.client.composition.enums.ChapterSource;
import com.beukay.marketing.person.client.composition.enums.CombinationStrategy;
import com.beukay.marketing.person.client.composition.enums.CompositionMode;
import com.beukay.marketing.person.client.composition.enums.ProjectStatus;
import com.beukay.marketing.person.domain.composition.ability.CompositionProjectService;
import com.beukay.marketing.person.domain.composition.gateway.CompositionChapterGateway;
import com.beukay.marketing.person.domain.composition.gateway.CompositionProjectGateway;
import com.beukay.marketing.person.domain.composition.model.CompositionChapter;
import com.beukay.marketing.person.domain.composition.model.CompositionProject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompositionProjectServiceImpl implements CompositionProjectService {

    private final CompositionProjectGateway projectGateway;
    private final CompositionChapterGateway chapterGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CompositionProject create(CompositionProject project) {
        applyDefaults(project);
        return projectGateway.save(project);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CompositionProject update(CompositionProject project) {
        applyDefaults(project);
        return projectGateway.save(project);
    }

    @Override
    public CompositionProject getDetail(Long id) {
        return projectGateway.findDetailById(id);
    }

    @Override
    public PageInfo<CompositionProject> page(String mode, String status, String name, String chapterSource, PageQuery pageQuery) {
        return projectGateway.page(mode, status, name, chapterSource, pageQuery);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        projectGateway.softDelete(id);
        chapterGateway.softDeleteAll(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<CompositionChapter> saveChapters(Long projectId, List<CompositionChapter> chapters) {
        for (int i = 0; i < chapters.size(); i++) {
            CompositionChapter ch = chapters.get(i);
            ch.setProjectId(projectId);
            if (ch.getSortNo() == null) {
                ch.setSortNo(i);
            }
        }
        return chapterGateway.replaceAll(projectId, chapters);
    }

    private void applyDefaults(CompositionProject p) {
        if (p.getMode() == null) {
            p.setMode(CompositionMode.SUN_WUKONG.name());
        }
        if (p.getChapterSource() == null || p.getChapterSource().isBlank()) {
            p.setChapterSource(ChapterSource.CATEGORY.name());
        }
        if (p.getCombinationStrategy() == null) {
            p.setCombinationStrategy(CombinationStrategy.ROOKIE.name());
        }
        if (p.getStatus() == null) {
            p.setStatus(ProjectStatus.DRAFT.name());
        }
        if (p.getTargetCount() == null) p.setTargetCount(10);
        if (p.getOutputWidth() == null) p.setOutputWidth(1080);
        if (p.getOutputHeight() == null) p.setOutputHeight(1920);
        if (p.getOutputFps() == null) p.setOutputFps(30);
        if (p.getBgmLoopMode() == null) p.setBgmLoopMode("LOOP");
        if (p.getBgmVolume() == null) p.setBgmVolume(70);
        if (p.getBgmStartChapter() == null) p.setBgmStartChapter(1);
    }
}
