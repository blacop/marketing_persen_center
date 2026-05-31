package com.beukay.marketing.person.app.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.executor.VideoAssemblyCmdExecutor;
import com.beukay.marketing.person.app.executor.VideoAssemblyDetailQryExecutor;
import com.beukay.marketing.person.client.api.VideoAssemblyFeign;
import com.beukay.marketing.person.client.cmd.VideoAssemblyGenerateCmd;
import com.beukay.marketing.person.client.dto.VideoAssemblyDTO;
import com.beukay.marketing.person.client.qry.VideoAssemblyDetailQry;
import com.beukay.marketing.person.client.qry.VideoAssemblyPageQry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class VideoAssemblyController implements VideoAssemblyFeign {
    private final VideoAssemblyCmdExecutor videoAssemblyCmdExecutor;
    private final VideoAssemblyDetailQryExecutor videoAssemblyDetailQryExecutor;

    @Override public Result<VideoAssemblyDTO> generate(VideoAssemblyGenerateCmd cmd) { return Result.success(videoAssemblyCmdExecutor.generate(cmd)); }
    @Override public Result<VideoAssemblyDTO> get(VideoAssemblyDetailQry qry) {
        if (qry.getTaskCode() != null && !qry.getTaskCode().isBlank()) {
            return Result.success(videoAssemblyDetailQryExecutor.getByTaskCode(qry.getTaskCode()));
        }
        return Result.success(videoAssemblyDetailQryExecutor.getById(qry.getId()));
    }
    @Override public Result<PageInfo<VideoAssemblyDTO>> listPage(VideoAssemblyPageQry qry) {
        return Result.success(videoAssemblyDetailQryExecutor.listPage(qry));
    }
}
