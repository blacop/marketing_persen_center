package com.beukay.marketing.person.domain.composition.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.composition.model.CompositionProject;

/** 合成项目网关 */
public interface CompositionProjectGateway {

    CompositionProject save(CompositionProject project);

    CompositionProject findById(Long id);

    /** 详情：返回项目 + 章节列表（按 sortNo 排序） */
    CompositionProject findDetailById(Long id);

    PageInfo<CompositionProject> page(String mode, String status, String name, String chapterSource, PageQuery pageQuery);

    void softDelete(Long id);
}
