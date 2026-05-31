package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.VideoDeconstructionResultDO;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface VideoDeconstructionResultConvertor extends BaseConvertor<VideoDeconstructionResult, VideoDeconstructionResultDO> {

    VideoDeconstructionResultConvertor INSTANCE = Mappers.getMapper(VideoDeconstructionResultConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "recordId", source = "recordId")
    @Mapping(target = "videoId", source = "videoId")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "skuTag", source = "skuTag")
    @Mapping(target = "hookType", source = "hookType")
    @Mapping(target = "sceneTags", source = "sceneTags")
    @Mapping(target = "sellingPointTags", source = "sellingPointTags")
    @Mapping(target = "ctaTags", source = "ctaTags")
    @Mapping(target = "titlePattern", source = "titlePattern")
    @Mapping(target = "emotionTags", source = "emotionTags")
    @Mapping(target = "targetAudienceTags", source = "targetAudienceTags")
    @Mapping(target = "recommendedPatternCode", source = "recommendedPatternCode")
    @Mapping(target = "recommendedPatternName", source = "recommendedPatternName")
    @Mapping(target = "recommendedPatternReason", source = "recommendedPatternReason")
    @Mapping(target = "patternDecisionJson", source = "patternDecisionJson")
    @Mapping(target = "deconstructionJson", source = "deconstructionJson")
    @Mapping(target = "version", source = "version")
    @Mapping(target = "actualPerformanceScore", source = "actualPerformanceScore")
    @Mapping(target = "verificationStatus", source = "verificationStatus")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    VideoDeconstructionResultDO to(VideoDeconstructionResult source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "recordId", source = "recordId")
    @Mapping(target = "videoId", source = "videoId")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "skuTag", source = "skuTag")
    @Mapping(target = "hookType", source = "hookType")
    @Mapping(target = "sceneTags", source = "sceneTags")
    @Mapping(target = "sellingPointTags", source = "sellingPointTags")
    @Mapping(target = "ctaTags", source = "ctaTags")
    @Mapping(target = "titlePattern", source = "titlePattern")
    @Mapping(target = "emotionTags", source = "emotionTags")
    @Mapping(target = "targetAudienceTags", source = "targetAudienceTags")
    @Mapping(target = "recommendedPatternCode", source = "recommendedPatternCode")
    @Mapping(target = "recommendedPatternName", source = "recommendedPatternName")
    @Mapping(target = "recommendedPatternReason", source = "recommendedPatternReason")
    @Mapping(target = "patternDecisionJson", source = "patternDecisionJson")
    @Mapping(target = "deconstructionJson", source = "deconstructionJson")
    @Mapping(target = "version", source = "version")
    @Mapping(target = "actualPerformanceScore", source = "actualPerformanceScore")
    @Mapping(target = "verificationStatus", source = "verificationStatus")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "operator", ignore = true)
    VideoDeconstructionResult from(VideoDeconstructionResultDO source);
}
