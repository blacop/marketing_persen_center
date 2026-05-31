package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.VideoAssemblyCandidateDTO;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyCandidate;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface VideoAssemblyCandidateDTOConvertor {
    VideoAssemblyCandidateDTOConvertor INSTANCE = Mappers.getMapper(VideoAssemblyCandidateDTOConvertor.class);

    default VideoAssemblyCandidateDTO convert(VideoAssemblyCandidate source) {
        return VideoAssemblyCandidateDTO.builder()
                .sectionNo(source.getSectionNo())
                .segmentId(source.getSegmentId())
                .videoId(source.getVideoId())
                .similarityScore(source.getSimilarityScore())
                .matchReasonJson(source.getMatchReasonJson())
                .rankNo(source.getRankNo())
                .selected(source.getSelected())
                .build();
    }
}
