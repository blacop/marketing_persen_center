package com.beukay.marketing.person.domain.composition.ability;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.composition.model.CompositionChapter;
import com.beukay.marketing.person.domain.composition.model.CompositionProject;

import java.util.List;

/** 合成项目领域服务 */
public interface CompositionProjectService {

    CompositionProject create(CompositionProject project);

    CompositionProject update(CompositionProject project);

    CompositionProject getDetail(Long id);

    PageInfo<CompositionProject> page(String mode, String status, String name, String chapterSource, PageQuery pageQuery);

    void delete(Long id);

    /**
     * 全量替换章节列表，并刷新 project tags_cache 不在范围（不做）。
     * 返回保存后的章节（带新 id 和 sortNo）。
     */
    List<CompositionChapter> saveChapters(Long projectId, List<CompositionChapter> chapters);
}
