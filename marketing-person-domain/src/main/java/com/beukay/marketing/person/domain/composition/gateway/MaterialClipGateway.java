package com.beukay.marketing.person.domain.composition.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.composition.model.MaterialClip;

import java.util.List;

/** 素材片段网关 */
public interface MaterialClipGateway {

    /** 新建素材，返回带 id 的实体 */
    MaterialClip create(MaterialClip clip, List<Long> tagIds);

    MaterialClip findById(Long id);

    /** 按 sha256 去重查找；不存在返回 null */
    MaterialClip findBySha256(String sha256);

    /** 分页。category 传 "__UNCATEGORIZED__" 表示筛选未分类素材 */
    PageInfo<MaterialClip> page(String kind,
                                 String name,
                                 List<Long> tagIds,
                                 String sourceType,
                                 String category,
                                 PageQuery pageQuery);

    /** 替换素材的标签关联，并刷新 tags_cache */
    MaterialClip replaceTags(Long clipId, List<Long> tagIds);

    /** 软删除 */
    void softDelete(Long id);
}
