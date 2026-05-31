package com.beukay.marketing.person.app.composition.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.composition.convertor.CompositionDTOConvertor;
import com.beukay.marketing.person.client.composition.dto.MaterialClipDTO;
import com.beukay.marketing.person.client.composition.qry.MaterialClipPageQry;
import com.beukay.marketing.person.domain.composition.ability.MaterialClipService;
import com.beukay.marketing.person.domain.composition.model.MaterialClip;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MaterialQryExecutor {

    private final MaterialClipService materialClipService;

    public PageInfo<MaterialClipDTO> page(MaterialClipPageQry qry) {
        PageInfo<MaterialClip> page = materialClipService.page(
                qry.getKind(), qry.getName(), qry.getTagIds(), qry.getSourceType(), qry.getCategory(), qry);
        return PageInfo.<MaterialClipDTO>builder()
                .pageIndex(page.getPageIndex())
                .pageSize(page.getPageSize())
                .total(page.getTotal())
                .records(CompositionDTOConvertor.INSTANCE.toMaterialClipDTOList(page.getRecords()))
                .build();
    }

    public MaterialClipDTO getById(Long id) {
        return CompositionDTOConvertor.INSTANCE.toMaterialClipDTO(materialClipService.getById(id));
    }
}
