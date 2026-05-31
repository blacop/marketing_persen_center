package com.beukay.marketing.person.domain.videoPatternCandidate.gateway;

import com.beukay.marketing.person.domain.videoPatternCandidate.model.VideoPatternCandidate;

import java.util.List;

public interface VideoPatternCandidateGateway {

    void batchCreate(List<VideoPatternCandidate> candidates);

    List<VideoPatternCandidate> listByDeconstructionResultId(Long deconstructionResultId);
}
