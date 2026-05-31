package com.beukay.marketing.person.domain.composition.ability;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.composition.model.MaterialClip;

import java.util.List;

/** 素材片段领域服务 */
public interface MaterialClipService {

    MaterialClip create(MaterialClip clip, List<Long> tagIds);

    MaterialClip getById(Long id);

    PageInfo<MaterialClip> page(String kind,
                                 String name,
                                 List<Long> tagIds,
                                 String sourceType,
                                 String category,
                                 PageQuery pageQuery);

    MaterialClip updateTags(Long id, List<Long> tagIds);

    void delete(Long id);
}
