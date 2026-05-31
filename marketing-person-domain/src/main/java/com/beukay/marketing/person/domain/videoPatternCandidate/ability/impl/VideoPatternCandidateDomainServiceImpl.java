package com.beukay.marketing.person.domain.videoPatternCandidate.ability.impl;

import com.beukay.marketing.person.domain.videoPatternCandidate.ability.VideoPatternCandidateDomainService;
import com.beukay.marketing.person.domain.videoPatternCandidate.gateway.VideoPatternCandidateGateway;
import com.beukay.marketing.person.domain.videoPatternCandidate.model.VideoPatternCandidate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VideoPatternCandidateDomainServiceImpl implements VideoPatternCandidateDomainService {

    private final VideoPatternCandidateGateway videoPatternCandidateGateway;

    @Override
    public void batchCreate(List<VideoPatternCandidate> candidates) {
        videoPatternCandidateGateway.batchCreate(candidates);
    }

    @Override
    public List<VideoPatternCandidate> listByDeconstructionResultId(Long deconstructionResultId) {
        return videoPatternCandidateGateway.listByDeconstructionResultId(deconstructionResultId);
    }
}
