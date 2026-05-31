package com.beukay.marketing.person.app.composition.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.composition.convertor.CompositionDTOConvertor;
import com.beukay.marketing.person.client.composition.dto.RenderJobDTO;
import com.beukay.marketing.person.client.composition.dto.RenderOutputDTO;
import com.beukay.marketing.person.client.composition.qry.RenderJobPageQry;
import com.beukay.marketing.person.domain.composition.ability.RenderJobService;
import com.beukay.marketing.person.domain.composition.model.RenderJob;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class RenderJobQryExecutor {

    private final RenderJobService renderJobService;

    public PageInfo<RenderJobDTO> page(RenderJobPageQry qry) {
        PageInfo<RenderJob> page = renderJobService.page(qry.getProjectId(), qry.getStatus(), qry);
        return PageInfo.<RenderJobDTO>builder()
                .pageIndex(page.getPageIndex())
                .pageSize(page.getPageSize())
                .total(page.getTotal())
                .records(CompositionDTOConvertor.INSTANCE.toRenderJobDTOList(page.getRecords()))
                .build();
    }

    public RenderJobDTO getById(Long id) {
        return CompositionDTOConvertor.INSTANCE.toRenderJobDTO(renderJobService.getById(id));
    }

    public List<RenderOutputDTO> outputs(Long jobId) {
        return CompositionDTOConvertor.INSTANCE.toRenderOutputDTOList(renderJobService.outputs(jobId));
    }
}
