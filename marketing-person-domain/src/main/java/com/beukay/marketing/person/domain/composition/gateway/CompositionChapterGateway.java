package com.beukay.marketing.person.domain.composition.gateway;

import com.beukay.marketing.person.domain.composition.model.CompositionChapter;

import java.util.List;

/** 章节网关 */
public interface CompositionChapterGateway {

    /**
     * 全量替换项目的章节列表：
     * - 已存在 id 的执行 update
     * - 没有 id 的执行 insert
     * - 不在传入列表中的旧章节软删除
     */
    List<CompositionChapter> replaceAll(Long projectId, List<CompositionChapter> chapters);

    List<CompositionChapter> findByProjectId(Long projectId);

    void softDeleteAll(Long projectId);
}
