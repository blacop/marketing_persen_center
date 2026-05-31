package com.beukay.marketing.person.domain.videoDeconstructionResult.ability.impl;

import com.beukay.marketing.person.domain.videoDeconstructionResult.ability.VideoDeconstructionResultDomainService;
import com.beukay.marketing.person.domain.videoDeconstructionResult.gateway.VideoDeconstructionResultGateway;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VideoDeconstructionResultDomainServiceImpl implements VideoDeconstructionResultDomainService {

    private final VideoDeconstructionResultGateway videoDeconstructionResultGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(VideoDeconstructionResult result) {
        return videoDeconstructionResultGateway.create(result);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(VideoDeconstructionResult result) {
        videoDeconstructionResultGateway.update(result);
    }

    @Override
    public VideoDeconstructionResult queryById(Long id) {
        return videoDeconstructionResultGateway.queryById(id);
    }

    @Override
    public VideoDeconstructionResult queryByRecordId(Long recordId) {
        return videoDeconstructionResultGateway.queryByRecordId(recordId);
    }

    @Override
    public VideoDeconstructionResult queryByVideoId(String videoId) {
        return videoDeconstructionResultGateway.queryByVideoId(videoId);
    }
}
