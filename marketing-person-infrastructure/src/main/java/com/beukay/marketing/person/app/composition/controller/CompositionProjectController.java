package com.beukay.marketing.person.app.composition.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.composition.executor.CompositionProjectCmdExecutor;
import com.beukay.marketing.person.app.composition.executor.CompositionProjectQryExecutor;
import com.beukay.marketing.person.app.composition.executor.RenderJobCmdExecutor;
import com.beukay.marketing.person.client.composition.api.CompositionProjectFeign;
import com.beukay.marketing.person.client.composition.cmd.ImportChaptersCmd;
import com.beukay.marketing.person.client.composition.cmd.SaveChaptersCmd;
import com.beukay.marketing.person.client.composition.cmd.SubmitRenderCmd;
import com.beukay.marketing.person.client.composition.cmd.UpsertCompositionProjectCmd;
import com.beukay.marketing.person.client.composition.dto.CompositionPlanPreviewDTO;
import com.beukay.marketing.person.client.composition.dto.CompositionProjectDTO;
import com.beukay.marketing.person.client.composition.dto.RenderJobDTO;
import com.beukay.marketing.person.client.composition.qry.CompositionProjectPageQry;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Log4j2
public class CompositionProjectController implements CompositionProjectFeign {

    private final CompositionProjectCmdExecutor projectCmdExecutor;
    private final CompositionProjectQryExecutor projectQryExecutor;
    private final RenderJobCmdExecutor renderJobCmdExecutor;

    @Override
    public Result<CompositionProjectDTO> create(UpsertCompositionProjectCmd cmd) {
        return Result.success(projectCmdExecutor.create(cmd));
    }

    @Override
    public Result<CompositionProjectDTO> update(Long id, UpsertCompositionProjectCmd cmd) {
        return Result.success(projectCmdExecutor.update(id, cmd));
    }

    @Override
    public Result<CompositionProjectDTO> getById(Long id) {
        return Result.success(projectQryExecutor.getDetail(id));
    }

    @Override
    public Result<PageInfo<CompositionProjectDTO>> page(CompositionProjectPageQry qry) {
        return Result.success(projectQryExecutor.page(qry));
    }

    @Override
    public Result<Void> delete(Long id) {
        projectCmdExecutor.delete(id);
        return Result.success(null);
    }

    @Override
    public Result<CompositionProjectDTO> saveChapters(Long id, SaveChaptersCmd cmd) {
        return Result.success(projectCmdExecutor.saveChapters(id, cmd));
    }

    @Override
    public Result<CompositionProjectDTO> importChapters(Long id, ImportChaptersCmd cmd) {
        return Result.success(projectCmdExecutor.importChapters(id, cmd));
    }

    @Override
    public Result<CompositionPlanPreviewDTO> preview(Long id, Integer count) {
        return Result.success(projectQryExecutor.preview(id, count));
    }

    @Override
    public Result<RenderJobDTO> submitRender(Long id, SubmitRenderCmd cmd) {
        return Result.success(renderJobCmdExecutor.submit(id, cmd));
    }
}
