package com.beukay.marketing.person.app.composition.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.composition.convertor.CompositionDTOConvertor;
import com.beukay.marketing.person.client.composition.dto.SourceVideoDTO;
import com.beukay.marketing.person.client.composition.qry.SourceVideoPageQry;
import com.beukay.marketing.person.domain.composition.ability.SourceVideoService;
import com.beukay.marketing.person.domain.composition.model.SourceVideo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SourceVideoQryExecutor {

    private final SourceVideoService service;

    public PageInfo<SourceVideoDTO> page(SourceVideoPageQry qry) {
        PageInfo<SourceVideo> page = service.page(qry.getStatus(), qry.getName(), qry);
        return PageInfo.<SourceVideoDTO>builder()
                .pageIndex(page.getPageIndex())
                .pageSize(page.getPageSize())
                .total(page.getTotal())
                .records(CompositionDTOConvertor.INSTANCE.toSourceVideoDTOList(page.getRecords()))
                .build();
    }

    public SourceVideoDTO getById(Long id) {
        return CompositionDTOConvertor.INSTANCE.toSourceVideoDTO(service.getById(id));
    }
}
