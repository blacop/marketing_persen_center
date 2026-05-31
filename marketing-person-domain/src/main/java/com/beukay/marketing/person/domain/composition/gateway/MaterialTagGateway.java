package com.beukay.marketing.person.domain.composition.gateway;

import com.beukay.marketing.person.domain.composition.model.MaterialTag;

import java.util.List;

/** 素材标签网关 */
public interface MaterialTagGateway {

    /** 创建（同 name+category 已存在则返回原实体，幂等） */
    MaterialTag createIfAbsent(MaterialTag tag);

    MaterialTag findById(Long id);

    List<MaterialTag> findByIds(List<Long> ids);

    List<MaterialTag> listAll(String category);

    void softDelete(Long id);
}
