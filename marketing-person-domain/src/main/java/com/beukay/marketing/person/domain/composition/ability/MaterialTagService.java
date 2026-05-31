package com.beukay.marketing.person.domain.composition.ability;

import com.beukay.marketing.person.domain.composition.model.MaterialTag;

import java.util.List;

/** 素材标签领域服务 */
public interface MaterialTagService {

    MaterialTag createIfAbsent(MaterialTag tag);

    List<MaterialTag> list(String category);

    void delete(Long id);
}
