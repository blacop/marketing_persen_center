package com.beukay.marketing.person.app.composition.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.composition.executor.RenderJobCmdExecutor;
import com.beukay.marketing.person.app.composition.executor.RenderJobQryExecutor;
import com.beukay.marketing.person.client.composition.api.RenderJobFeign;
import com.beukay.marketing.person.client.composition.dto.RenderJobDTO;
import com.beukay.marketing.person.client.composition.dto.RenderOutputDTO;
import com.beukay.marketing.person.client.composition.qry.RenderJobPageQry;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Log4j2
public class RenderJobController implements RenderJobFeign {

    private final RenderJobCmdExecutor renderJobCmdExecutor;
    private final RenderJobQryExecutor renderJobQryExecutor;

    @Override
    public Result<PageInfo<RenderJobDTO>> page(RenderJobPageQry qry) {
        return Result.success(renderJobQryExecutor.page(qry));
    }

    @Override
    public Result<RenderJobDTO> getById(Long id) {
        return Result.success(renderJobQryExecutor.getById(id));
    }

    @Override
    public Result<List<RenderOutputDTO>> listOutputs(Long id) {
        return Result.success(renderJobQryExecutor.outputs(id));
    }

    @Override
    public Result<Void> cancel(Long id) {
        renderJobCmdExecutor.cancel(id);
        return Result.success(null);
    }
}
