package com.beukay.marketing.person.domain.composition.ability.impl;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.composition.ability.VoiceoverAssetService;
import com.beukay.marketing.person.domain.composition.gateway.VoiceoverAssetGateway;
import com.beukay.marketing.person.domain.composition.model.VoiceoverAsset;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VoiceoverAssetServiceImpl implements VoiceoverAssetService {

    private final VoiceoverAssetGateway voiceoverAssetGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public VoiceoverAsset create(VoiceoverAsset asset) {
        return voiceoverAssetGateway.create(asset);
    }

    @Override
    public VoiceoverAsset getById(Long id) {
        return voiceoverAssetGateway.findById(id);
    }

    @Override
    public PageInfo<VoiceoverAsset> page(String source, String text, String category, PageQuery pageQuery) {
        return voiceoverAssetGateway.page(source, text, category, pageQuery);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        voiceoverAssetGateway.softDelete(id);
    }
}
