package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.VideoPatternCandidateDO;
import com.beukay.marketing.person.domain.videoPatternCandidate.model.VideoPatternCandidate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface VideoPatternCandidateConvertor extends BaseConvertor<VideoPatternCandidate, VideoPatternCandidateDO> {

    VideoPatternCandidateConvertor INSTANCE = Mappers.getMapper(VideoPatternCandidateConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "deconstructionResultId", source = "deconstructionResultId")
    @Mapping(target = "recordId", source = "recordId")
    @Mapping(target = "videoId", source = "videoId")
    @Mapping(target = "patternCode", source = "patternCode")
    @Mapping(target = "patternName", source = "patternName")
    @Mapping(target = "matchScore", source = "matchScore")
    @Mapping(target = "reasonJson", source = "reasonJson")
    @Mapping(target = "rankNo", source = "rankNo")
    @Mapping(target = "isRecommended", source = "recommended")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    VideoPatternCandidateDO to(VideoPatternCandidate source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "deconstructionResultId", source = "deconstructionResultId")
    @Mapping(target = "recordId", source = "recordId")
    @Mapping(target = "videoId", source = "videoId")
    @Mapping(target = "patternCode", source = "patternCode")
    @Mapping(target = "patternName", source = "patternName")
    @Mapping(target = "matchScore", source = "matchScore")
    @Mapping(target = "reasonJson", source = "reasonJson")
    @Mapping(target = "rankNo", source = "rankNo")
    @Mapping(target = "recommended", source = "isRecommended")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "operator", ignore = true)
    VideoPatternCandidate from(VideoPatternCandidateDO source);
}
