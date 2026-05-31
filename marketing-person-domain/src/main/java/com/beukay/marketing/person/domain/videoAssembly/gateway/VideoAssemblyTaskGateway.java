package com.beukay.marketing.person.domain.videoAssembly.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyTask;

public interface VideoAssemblyTaskGateway {
    Long create(VideoAssemblyTask task);
    void update(VideoAssemblyTask task);
    VideoAssemblyTask queryById(Long id);
    VideoAssemblyTask queryByTaskCode(String taskCode);
    PageInfo<VideoAssemblyTask> listPage(String status, String blueprintCode, PageQuery pageQuery);
}
