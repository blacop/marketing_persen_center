package com.beukay.marketing.person.domain.composition.ability;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.composition.model.VoiceoverAsset;

/** 配音领域服务 */
public interface VoiceoverAssetService {

    VoiceoverAsset create(VoiceoverAsset asset);

    VoiceoverAsset getById(Long id);

    PageInfo<VoiceoverAsset> page(String source, String text, String category, PageQuery pageQuery);

    void delete(Long id);
}
