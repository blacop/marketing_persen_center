package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.CmVideoSegmentDO;
import com.beukay.marketing.person.domain.cutmatrix.segment.model.CmVideoSegment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface CmVideoSegmentConvertor extends BaseConvertor<CmVideoSegment, CmVideoSegmentDO> {

    CmVideoSegmentConvertor INSTANCE = Mappers.getMapper(CmVideoSegmentConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "segmentCode", source = "segmentCode")
    @Mapping(target = "collectionCode", source = "collectionCode")
    @Mapping(target = "chapterCode", source = "chapterCode")
    @Mapping(target = "videoUrl", source = "videoUrl")
    @Mapping(target = "startSec", source = "startSec")
    @Mapping(target = "endSec", source = "endSec")
    @Mapping(target = "durationSec", source = "durationSec")
    @Mapping(target = "width", source = "width")
    @Mapping(target = "height", source = "height")
    @Mapping(target = "fps", source = "fps")
    @Mapping(target = "noMirror", source = "noMirror")
    @Mapping(target = "orderNo", source = "orderNo")
    @Mapping(target = "stageCode", source = "stageCode")
    @Mapping(target = "sceneTags", source = "sceneTags")
    @Mapping(target = "sellingPointTags", source = "sellingPointTags")
    @Mapping(target = "hookType", source = "hookType")
    @Mapping(target = "caption", source = "caption")
    @Mapping(target = "sourceType", source = "sourceType")
    @Mapping(target = "sourceSegmentId", source = "sourceSegmentId")
    @Mapping(target = "sourceVideoId", source = "sourceVideoId")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    CmVideoSegmentDO to(CmVideoSegment source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "segmentCode", source = "segmentCode")
    @Mapping(target = "collectionCode", source = "collectionCode")
    @Mapping(target = "chapterCode", source = "chapterCode")
    @Mapping(target = "videoUrl", source = "videoUrl")
    @Mapping(target = "startSec", source = "startSec")
    @Mapping(target = "endSec", source = "endSec")
    @Mapping(target = "durationSec", source = "durationSec")
    @Mapping(target = "width", source = "width")
    @Mapping(target = "height", source = "height")
    @Mapping(target = "fps", source = "fps")
    @Mapping(target = "noMirror", source = "noMirror")
    @Mapping(target = "orderNo", source = "orderNo")
    @Mapping(target = "stageCode", source = "stageCode")
    @Mapping(target = "sceneTags", source = "sceneTags")
    @Mapping(target = "sellingPointTags", source = "sellingPointTags")
    @Mapping(target = "hookType", source = "hookType")
    @Mapping(target = "caption", source = "caption")
    @Mapping(target = "sourceType", source = "sourceType")
    @Mapping(target = "sourceSegmentId", source = "sourceSegmentId")
    @Mapping(target = "sourceVideoId", source = "sourceVideoId")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "operator", ignore = true)
    CmVideoSegment from(CmVideoSegmentDO source);
}
