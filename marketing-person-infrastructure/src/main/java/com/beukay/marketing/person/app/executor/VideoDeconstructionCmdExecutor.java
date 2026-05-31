package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.app.convertor.VideoDeconstructionDTOConvertor;
import com.beukay.marketing.person.app.service.VideoKnowledgeBuildAppService;
import com.beukay.marketing.person.app.service.VideoUnderstandingTaskAppService;
import com.beukay.marketing.person.client.cmd.VideoDeconstructionCreateCmd;
import com.beukay.marketing.person.client.cmd.VideoDeconstructionSubmitUrlCmd;
import com.beukay.marketing.person.client.dto.VideoDeconstructionDTO;
import com.beukay.marketing.person.client.dto.VideoDeconstructionTaskDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.beukay.ai.common.exception.GenericBusinessException;
@Log4j2
@Component
@RequiredArgsConstructor
public class VideoDeconstructionCmdExecutor {

    private final VideoKnowledgeBuildAppService videoKnowledgeBuildAppService;
    private final VideoUnderstandingTaskAppService videoUnderstandingTaskAppService;

    public VideoDeconstructionDTO deconstruct(VideoDeconstructionCreateCmd cmd) {
        return VideoDeconstructionDTOConvertor.INSTANCE.convert(
                videoKnowledgeBuildAppService.deconstruct(cmd.getRecordId(), cmd.getSkuId()));
    }

    public VideoDeconstructionTaskDTO submitUnderstandingTaskUpload(MultipartFile file, String skuId, String sourceLabel) {
        try {
            return videoUnderstandingTaskAppService.submitUpload(file, skuId, sourceLabel);
        } catch (Exception ex) {
            throw new GenericBusinessException("上传视频并创建任务失败" + ": " + ex.getMessage());
        }
    }

    public VideoDeconstructionTaskDTO submitUnderstandingTaskUrl(VideoDeconstructionSubmitUrlCmd cmd) {
        return videoUnderstandingTaskAppService.submitUrl(cmd.getVideoUrl(), cmd.getSkuId(), cmd.getSourceLabel());
    }
}
