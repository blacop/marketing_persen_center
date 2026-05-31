package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.app.convertor.VideoDeconstructionDTOConvertor;
import com.beukay.marketing.person.client.dto.VideoDeconstructionDTO;
import com.beukay.marketing.person.domain.videoDeconstructionResult.gateway.VideoDeconstructionResultGateway;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import com.beukay.ai.common.exception.GenericBusinessException;
@Log4j2
@Component
@RequiredArgsConstructor
public class VideoDeconstructionDetailQryExecutor {

    private final VideoDeconstructionResultGateway videoDeconstructionResultGateway;

    public VideoDeconstructionDTO getById(Long id) {
        VideoDeconstructionResult result = videoDeconstructionResultGateway.queryById(id);
        if (result == null) {
            throw new GenericBusinessException("VideoDeconstructionResult不存在: " + id);
        }
        return VideoDeconstructionDTOConvertor.INSTANCE.convert(result);
    }
}
