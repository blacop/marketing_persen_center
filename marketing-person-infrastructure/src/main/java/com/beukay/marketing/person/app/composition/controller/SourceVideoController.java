package com.beukay.marketing.person.app.composition.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.composition.executor.SourceVideoCmdExecutor;
import com.beukay.marketing.person.app.composition.executor.SourceVideoQryExecutor;
import com.beukay.marketing.person.client.composition.api.SourceVideoFeign;
import com.beukay.marketing.person.client.composition.cmd.CreateSourceVideoCmd;
import com.beukay.marketing.person.client.composition.cmd.ImportSourceVideoFromUrlCmd;
import com.beukay.marketing.person.client.composition.cmd.UpdateSegmentsCmd;
import com.beukay.marketing.person.client.composition.dto.SourceVideoDTO;
import com.beukay.marketing.person.client.composition.qry.SourceVideoPageQry;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Log4j2
public class SourceVideoController implements SourceVideoFeign {

    private final SourceVideoCmdExecutor cmdExecutor;
    private final SourceVideoQryExecutor qryExecutor;

    @Override
    public Result<SourceVideoDTO> create(CreateSourceVideoCmd cmd) {
        return Result.success(cmdExecutor.create(cmd));
    }

    @Override
    public Result<SourceVideoDTO> importFromUrl(ImportSourceVideoFromUrlCmd cmd) {
        return Result.success(cmdExecutor.importFromUrl(cmd));
    }

    @Override
    public Result<PageInfo<SourceVideoDTO>> page(SourceVideoPageQry qry) {
        return Result.success(qryExecutor.page(qry));
    }

    @Override
    public Result<SourceVideoDTO> getById(Long id) {
        return Result.success(qryExecutor.getById(id));
    }

    @Override
    public Result<SourceVideoDTO> updateSegments(Long id, UpdateSegmentsCmd cmd) {
        return Result.success(cmdExecutor.updateSegments(id, cmd));
    }

    @Override
    public Result<SourceVideoDTO> exportSplit(Long id) {
        return Result.success(cmdExecutor.exportSplit(id));
    }

    @Override
    public Result<SourceVideoDTO> autoSplit(Long id) {
        return Result.success(cmdExecutor.autoSplit(id));
    }

    @Override
    public Result<Void> delete(Long id) {
        cmdExecutor.delete(id);
        return Result.success(null);
    }
}
