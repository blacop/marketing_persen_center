package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.beukay.marketing.person.dbsdk.dao.VideoPatternCandidateDOMapper;
import com.beukay.marketing.person.dbsdk.model.VideoPatternCandidateDO;
import com.beukay.marketing.person.domain.videoPatternCandidate.gateway.VideoPatternCandidateGateway;
import com.beukay.marketing.person.domain.videoPatternCandidate.model.VideoPatternCandidate;
import com.beukay.marketing.person.infrastructure.convertor.VideoPatternCandidateConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class VideoPatternCandidateGatewayImpl implements VideoPatternCandidateGateway {

    private final VideoPatternCandidateDOMapper mapper;

    @Override
    public void batchCreate(List<VideoPatternCandidate> candidates) {
        for (VideoPatternCandidate candidate : candidates) {
            mapper.insert(VideoPatternCandidateConvertor.INSTANCE.to(candidate));
        }
    }

    @Override
    public List<VideoPatternCandidate> listByDeconstructionResultId(Long deconstructionResultId) {
        return mapper.selectList(new LambdaQueryWrapper<VideoPatternCandidateDO>()
                        .eq(VideoPatternCandidateDO::getDeconstructionResultId, deconstructionResultId)
                        .eq(VideoPatternCandidateDO::getIsDeleted, 0)
                        .orderByAsc(VideoPatternCandidateDO::getRankNo)
                        .orderByDesc(VideoPatternCandidateDO::getMatchScore)
                        .orderByDesc(VideoPatternCandidateDO::getId))
                .stream()
                .map(VideoPatternCandidateConvertor.INSTANCE::from)
                .toList();
    }
}
