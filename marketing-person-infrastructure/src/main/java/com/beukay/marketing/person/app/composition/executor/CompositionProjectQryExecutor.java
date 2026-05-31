package com.beukay.marketing.person.app.composition.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.composition.convertor.CompositionDTOConvertor;
import com.beukay.marketing.person.client.composition.dto.CompositionPlanPreviewDTO;
import com.beukay.marketing.person.client.composition.dto.CompositionProjectDTO;
import com.beukay.marketing.person.client.composition.qry.CompositionProjectPageQry;
import com.beukay.marketing.person.domain.composition.ability.CompositionPlanner;
import com.beukay.marketing.person.domain.composition.ability.CompositionProjectService;
import com.beukay.marketing.person.domain.composition.model.CompositionPlan;
import com.beukay.marketing.person.domain.composition.model.CompositionProject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

import com.beukay.ai.common.exception.GenericBusinessException;
@Component
@RequiredArgsConstructor
public class CompositionProjectQryExecutor {

    private final CompositionProjectService projectService;
    private final CompositionPlanner compositionPlanner;

    public CompositionProjectDTO getDetail(Long id) {
        return CompositionDTOConvertor.INSTANCE.toProjectDTO(projectService.getDetail(id));
    }

    public PageInfo<CompositionProjectDTO> page(CompositionProjectPageQry qry) {
        PageInfo<CompositionProject> page = projectService.page(
                qry.getMode(), qry.getStatus(), qry.getName(), qry.getChapterSource(), qry);
        return PageInfo.<CompositionProjectDTO>builder()
                .pageIndex(page.getPageIndex())
                .pageSize(page.getPageSize())
                .total(page.getTotal())
                .records(CompositionDTOConvertor.INSTANCE.toProjectDTOList(page.getRecords()))
                .build();
    }

    public CompositionPlanPreviewDTO preview(Long projectId, Integer count) {
        CompositionProject project = projectService.getDetail(projectId);
        if (project == null) {
            throw new GenericBusinessException("project not found: " + projectId);
        }
        int requested = count != null ? count
                : (project.getTargetCount() == null ? 5 : project.getTargetCount());
        int previewN = Math.max(1, Math.min(1000, requested));
        List<CompositionPlan> plans = compositionPlanner.plan(project, previewN);
        return CompositionDTOConvertor.INSTANCE.toPlanPreviewDTO(previewN, plans);
    }
}
