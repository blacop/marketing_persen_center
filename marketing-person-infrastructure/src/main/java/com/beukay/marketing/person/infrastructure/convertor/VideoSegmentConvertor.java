package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.VideoSegmentDO;
import com.beukay.marketing.person.domain.videoSegment.model.VideoSegment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

/**
 * 视频最小单元 Domain ↔ DO 转换器
 */
@Mapper(uses = BooleanStrategy.class)
public interface VideoSegmentConvertor extends BaseConvertor<VideoSegment, VideoSegmentDO> {

    VideoSegmentConvertor INSTANCE = Mappers.getMapper(VideoSegmentConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    @Mapping(target = "taskId", source = "taskId")
    @Mapping(target = "videoId", source = "videoId")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "segmentIndex", source = "segmentIndex")
    @Mapping(target = "startSec", source = "startSec")
    @Mapping(target = "endSec", source = "endSec")
    @Mapping(target = "structureTag", source = "structureTag")
    @Mapping(target = "motivation", source = "motivation")
    @Mapping(target = "technique", source = "technique")
    @Mapping(target = "cameraLanguage", source = "cameraLanguage")
    @Mapping(target = "scene", source = "scene")
    @Mapping(target = "signalStrength", source = "signalStrength")
    @Mapping(target = "keyPhrase", source = "keyPhrase")
    @Mapping(target = "script", source = "script")
    @Mapping(target = "sellingPoint", source = "sellingPoint")
    @Mapping(target = "isDecisiveFrame", source = "decisiveFrame")
    @Mapping(target = "decisiveFrameDesc", source = "decisiveFrameDesc")
    @Mapping(target = "influencerLevel", source = "influencerLevel")
    @Mapping(target = "audiencePersona", source = "audiencePersona")
    @Mapping(target = "bgm", source = "bgm")
    @Mapping(target = "rhythm", source = "rhythm")
    @Mapping(target = "wardrobe", source = "wardrobe")
    @Mapping(target = "audio", source = "audio")
    @Mapping(target = "skinType", source = "skinType")
    @Mapping(target = "trending", source = "trending")
    @Mapping(target = "verificationStatus", source = "verificationStatus")
    VideoSegmentDO to(VideoSegment source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "taskId", source = "taskId")
    @Mapping(target = "videoId", source = "videoId")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "segmentIndex", source = "segmentIndex")
    @Mapping(target = "startSec", source = "startSec")
    @Mapping(target = "endSec", source = "endSec")
    @Mapping(target = "structureTag", source = "structureTag")
    @Mapping(target = "motivation", source = "motivation")
    @Mapping(target = "technique", source = "technique")
    @Mapping(target = "cameraLanguage", source = "cameraLanguage")
    @Mapping(target = "scene", source = "scene")
    @Mapping(target = "signalStrength", source = "signalStrength")
    @Mapping(target = "keyPhrase", source = "keyPhrase")
    @Mapping(target = "script", source = "script")
    @Mapping(target = "sellingPoint", source = "sellingPoint")
    @Mapping(target = "decisiveFrame", source = "isDecisiveFrame")
    @Mapping(target = "decisiveFrameDesc", source = "decisiveFrameDesc")
    @Mapping(target = "influencerLevel", source = "influencerLevel")
    @Mapping(target = "audiencePersona", source = "audiencePersona")
    @Mapping(target = "bgm", source = "bgm")
    @Mapping(target = "rhythm", source = "rhythm")
    @Mapping(target = "wardrobe", source = "wardrobe")
    @Mapping(target = "audio", source = "audio")
    @Mapping(target = "skinType", source = "skinType")
    @Mapping(target = "trending", source = "trending")
    @Mapping(target = "verificationStatus", source = "verificationStatus")
    @Mapping(target = "operator", ignore = true)
    VideoSegment from(VideoSegmentDO source);
}
