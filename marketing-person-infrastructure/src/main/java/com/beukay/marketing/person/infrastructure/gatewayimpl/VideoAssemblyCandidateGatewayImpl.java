package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.beukay.marketing.person.dbsdk.dao.VideoAssemblyCandidateDOMapper;
import com.beukay.marketing.person.dbsdk.model.VideoAssemblyCandidateDO;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyCandidateGateway;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyCandidate;
import com.beukay.marketing.person.infrastructure.convertor.VideoAssemblyCandidateConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class VideoAssemblyCandidateGatewayImpl implements VideoAssemblyCandidateGateway {
    private final VideoAssemblyCandidateDOMapper mapper;
    @Override public void batchCreate(List<VideoAssemblyCandidate> candidates) { for (VideoAssemblyCandidate candidate : candidates) { mapper.insert(VideoAssemblyCandidateConvertor.INSTANCE.to(candidate)); } }
    @Override public List<VideoAssemblyCandidate> listByTaskCode(String taskCode) { return mapper.selectList(new LambdaQueryWrapper<VideoAssemblyCandidateDO>().eq(VideoAssemblyCandidateDO::getTaskCode, taskCode).eq(VideoAssemblyCandidateDO::getIsDeleted, 0).orderByAsc(VideoAssemblyCandidateDO::getSectionNo).orderByAsc(VideoAssemblyCandidateDO::getRankNo)).stream().map(VideoAssemblyCandidateConvertor.INSTANCE::from).toList(); }
}
