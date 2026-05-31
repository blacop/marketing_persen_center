package com.beukay.marketing.person.domain.videoAssembly.ability;

import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyTask;

public interface VideoAssemblyTaskDomainService {
    Long create(VideoAssemblyTask task);
    void update(VideoAssemblyTask task);
    VideoAssemblyTask queryById(Long id);
    VideoAssemblyTask queryByTaskCode(String taskCode);
}
