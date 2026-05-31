package com.beukay.marketing.person.domain.videoAssembly.ability.impl;

import com.beukay.marketing.person.domain.videoAssembly.ability.VideoAssemblyTaskDomainService;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyTaskGateway;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyTask;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VideoAssemblyTaskDomainServiceImpl implements VideoAssemblyTaskDomainService {
    private final VideoAssemblyTaskGateway videoAssemblyTaskGateway;
    @Override public Long create(VideoAssemblyTask task) { return videoAssemblyTaskGateway.create(task); }
    @Override public void update(VideoAssemblyTask task) { videoAssemblyTaskGateway.update(task); }
    @Override public VideoAssemblyTask queryById(Long id) { return videoAssemblyTaskGateway.queryById(id); }
    @Override public VideoAssemblyTask queryByTaskCode(String taskCode) { return videoAssemblyTaskGateway.queryByTaskCode(taskCode); }
}
