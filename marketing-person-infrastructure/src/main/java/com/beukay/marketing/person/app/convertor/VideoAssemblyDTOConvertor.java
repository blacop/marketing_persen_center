package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.VideoAssemblyDTO;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyTask;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface VideoAssemblyDTOConvertor {
    VideoAssemblyDTOConvertor INSTANCE = Mappers.getMapper(VideoAssemblyDTOConvertor.class);

    default VideoAssemblyDTO convert(VideoAssemblyTask source) {
        return VideoAssemblyDTO.builder()
                .id(source.getId())
                .taskCode(source.getTaskCode())
                .blueprintCode(source.getBlueprintCode())
                .status(source.getStatus())
                .platform(source.getPlatform())
                .targetDuration(source.getTargetDuration())
                .interventionStatus(source.getInterventionStatus())
                .summaryJson(source.getSummaryJson())
                .build();
    }
}
