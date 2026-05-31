package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.beukay.marketing.person.dbsdk.dao.VideoAssemblyPlanDOMapper;
import com.beukay.marketing.person.dbsdk.model.VideoAssemblyPlanDO;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyPlanGateway;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyPlan;
import com.beukay.marketing.person.infrastructure.convertor.VideoAssemblyPlanConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class VideoAssemblyPlanGatewayImpl implements VideoAssemblyPlanGateway {
    private final VideoAssemblyPlanDOMapper mapper;
    @Override public void batchCreate(List<VideoAssemblyPlan> plans) { for (VideoAssemblyPlan plan : plans) { mapper.insert(VideoAssemblyPlanConvertor.INSTANCE.to(plan)); } }
    @Override public List<VideoAssemblyPlan> listByTaskCode(String taskCode) { return mapper.selectList(new LambdaQueryWrapper<VideoAssemblyPlanDO>().eq(VideoAssemblyPlanDO::getTaskCode, taskCode).eq(VideoAssemblyPlanDO::getIsDeleted, 0).orderByAsc(VideoAssemblyPlanDO::getSectionNo)).stream().map(VideoAssemblyPlanConvertor.INSTANCE::from).toList(); }
}
