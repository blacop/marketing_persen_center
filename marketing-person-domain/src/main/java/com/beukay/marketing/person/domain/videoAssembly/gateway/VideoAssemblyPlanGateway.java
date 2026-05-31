package com.beukay.marketing.person.domain.videoAssembly.gateway;

import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyPlan;

import java.util.List;

public interface VideoAssemblyPlanGateway {
    void batchCreate(List<VideoAssemblyPlan> plans);
    List<VideoAssemblyPlan> listByTaskCode(String taskCode);
}
