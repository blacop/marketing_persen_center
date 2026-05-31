package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.VideoAssemblyCandidateDO;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyCandidate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface VideoAssemblyCandidateConvertor extends BaseConvertor<VideoAssemblyCandidate, VideoAssemblyCandidateDO> {
    VideoAssemblyCandidateConvertor INSTANCE = Mappers.getMapper(VideoAssemblyCandidateConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "taskCode", source = "taskCode")
    @Mapping(target = "sectionNo", source = "sectionNo")
    @Mapping(target = "segmentId", source = "segmentId")
    @Mapping(target = "videoId", source = "videoId")
    @Mapping(target = "similarityScore", source = "similarityScore")
    @Mapping(target = "matchReasonJson", source = "matchReasonJson")
    @Mapping(target = "rankNo", source = "rankNo")
    @Mapping(target = "isSelected", source = "selected")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    VideoAssemblyCandidateDO to(VideoAssemblyCandidate source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "taskCode", source = "taskCode")
    @Mapping(target = "sectionNo", source = "sectionNo")
    @Mapping(target = "segmentId", source = "segmentId")
    @Mapping(target = "videoId", source = "videoId")
    @Mapping(target = "similarityScore", source = "similarityScore")
    @Mapping(target = "matchReasonJson", source = "matchReasonJson")
    @Mapping(target = "rankNo", source = "rankNo")
    @Mapping(target = "selected", source = "isSelected")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "operator", ignore = true)
    VideoAssemblyCandidate from(VideoAssemblyCandidateDO source);
}
