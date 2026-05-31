package com.beukay.marketing.person.domain.videoAssembly.gateway;

import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyCandidate;

import java.util.List;

public interface VideoAssemblyCandidateGateway {
    void batchCreate(List<VideoAssemblyCandidate> candidates);
    List<VideoAssemblyCandidate> listByTaskCode(String taskCode);
}
