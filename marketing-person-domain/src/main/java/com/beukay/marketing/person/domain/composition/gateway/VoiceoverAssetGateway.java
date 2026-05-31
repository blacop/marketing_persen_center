package com.beukay.marketing.person.domain.composition.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.composition.model.VoiceoverAsset;

/** 配音资源网关 */
public interface VoiceoverAssetGateway {

    VoiceoverAsset create(VoiceoverAsset asset);

    VoiceoverAsset findById(Long id);

    /** category 传 "__UNCATEGORIZED__" 表示筛选未分类 */
    PageInfo<VoiceoverAsset> page(String source, String text, String category, PageQuery pageQuery);

    void softDelete(Long id);
}
