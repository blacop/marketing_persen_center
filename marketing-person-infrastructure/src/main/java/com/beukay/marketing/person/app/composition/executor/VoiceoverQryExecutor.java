package com.beukay.marketing.person.app.composition.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.composition.convertor.CompositionDTOConvertor;
import com.beukay.marketing.person.client.composition.dto.VoiceoverAssetDTO;
import com.beukay.marketing.person.client.composition.qry.VoiceoverAssetPageQry;
import com.beukay.marketing.person.domain.composition.ability.VoiceoverAssetService;
import com.beukay.marketing.person.domain.composition.model.VoiceoverAsset;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VoiceoverQryExecutor {

    private final VoiceoverAssetService voiceoverAssetService;

    public PageInfo<VoiceoverAssetDTO> page(VoiceoverAssetPageQry qry) {
        PageInfo<VoiceoverAsset> page = voiceoverAssetService.page(qry.getSource(), qry.getText(), qry.getCategory(), qry);
        return PageInfo.<VoiceoverAssetDTO>builder()
                .pageIndex(page.getPageIndex())
                .pageSize(page.getPageSize())
                .total(page.getTotal())
                .records(CompositionDTOConvertor.INSTANCE.toVoiceoverDTOList(page.getRecords()))
                .build();
    }

    public VoiceoverAssetDTO getById(Long id) {
        return CompositionDTOConvertor.INSTANCE.toVoiceoverDTO(voiceoverAssetService.getById(id));
    }
}
