package com.beukay.marketing.person.app.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.executor.VideoDeconstructionCmdExecutor;
import com.beukay.marketing.person.app.executor.VideoDeconstructionDetailQryExecutor;
import com.beukay.marketing.person.app.executor.VideoDeconstructionTaskQryExecutor;
import com.beukay.marketing.person.app.executor.VideoDeconstructionQryExecutor;
import com.beukay.marketing.person.client.api.VideoDeconstructionFeign;
import com.beukay.marketing.person.client.cmd.VideoDeconstructionCreateCmd;
import com.beukay.marketing.person.client.cmd.VideoDeconstructionSubmitUrlCmd;
import com.beukay.marketing.person.client.dto.VideoDeconstructionDTO;
import com.beukay.marketing.person.client.dto.VideoDeconstructionTaskDTO;
import com.beukay.marketing.person.client.qry.VideoDeconstructionDetailQry;
import com.beukay.marketing.person.client.qry.VideoDeconstructionTaskGetQry;
import com.beukay.marketing.person.client.qry.VideoDeconstructionPageQry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class VideoDeconstructionController implements VideoDeconstructionFeign {

    private final VideoDeconstructionCmdExecutor videoDeconstructionCmdExecutor;
    private final VideoDeconstructionDetailQryExecutor videoDeconstructionDetailQryExecutor;
    private final VideoDeconstructionQryExecutor videoDeconstructionQryExecutor;
    private final VideoDeconstructionTaskQryExecutor videoDeconstructionTaskQryExecutor;

    @Override
    public Result<VideoDeconstructionDTO> deconstructVideo(VideoDeconstructionCreateCmd cmd) {
        return Result.success(videoDeconstructionCmdExecutor.deconstruct(cmd));
    }

    @Override
    public Result<VideoDeconstructionTaskDTO> submitUnderstandingTaskUpload(MultipartFile file, String skuId, String sourceLabel) {
        return Result.success(videoDeconstructionCmdExecutor.submitUnderstandingTaskUpload(file, skuId, sourceLabel));
    }

    @Override
    public Result<VideoDeconstructionTaskDTO> submitUnderstandingTaskUrl(VideoDeconstructionSubmitUrlCmd cmd) {
        return Result.success(videoDeconstructionCmdExecutor.submitUnderstandingTaskUrl(cmd));
    }

    @Override
    public Result<VideoDeconstructionTaskDTO> getUnderstandingTask(VideoDeconstructionTaskGetQry qry) {
        return Result.success(videoDeconstructionTaskQryExecutor.get(qry.getTaskId()));
    }

    @Override
    public Result<VideoDeconstructionDTO> getVideoDeconstruction(VideoDeconstructionDetailQry qry) {
        return Result.success(videoDeconstructionDetailQryExecutor.getById(qry.getId()));
    }

    @Override
    public Result<PageInfo<VideoDeconstructionDTO>> listVideoDeconstructionPage(VideoDeconstructionPageQry qry) {
        return Result.success(videoDeconstructionQryExecutor.listPage(qry));
    }
}
