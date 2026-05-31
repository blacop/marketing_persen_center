package com.beukay.marketing.person.domain.videoPatternCandidate.ability;

import com.beukay.marketing.person.domain.videoPatternCandidate.model.VideoPatternCandidate;

import java.util.List;

public interface VideoPatternCandidateDomainService {

    void batchCreate(List<VideoPatternCandidate> candidates);

    List<VideoPatternCandidate> listByDeconstructionResultId(Long deconstructionResultId);
}
