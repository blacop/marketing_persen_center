package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.VideoAssemblyPlanSectionDTO;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyPlan;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface VideoAssemblyPlanSectionDTOConvertor {
    VideoAssemblyPlanSectionDTOConvertor INSTANCE = Mappers.getMapper(VideoAssemblyPlanSectionDTOConvertor.class);

    default VideoAssemblyPlanSectionDTO convert(VideoAssemblyPlan source) {
        return VideoAssemblyPlanSectionDTO.builder()
                .sectionNo(source.getSectionNo())
                .segmentId(source.getSegmentId())
                .videoId(source.getVideoId())
                .selectionReasonJson(source.getSelectionReasonJson())
                .build();
    }
}
