package com.beukay.marketing.person.infrastructure.composition.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.composition.model.SourceVideoDO;
import com.beukay.marketing.person.domain.composition.model.SourceVideo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

/**
 * SourceVideo ↔ SourceVideoDO。segments 由 GatewayImpl 用 ObjectMapper 处理 segmentsJson 编解码。
 */
@Mapper(uses = BooleanStrategy.class)
public interface SourceVideoConvertor extends BaseConvertor<SourceVideo, SourceVideoDO> {

    SourceVideoConvertor INSTANCE = Mappers.getMapper(SourceVideoConvertor.class);

    @Override
    @Mapping(target = "segmentsJson", ignore = true)
    @Mapping(source = "baseFields.nezhaTenantCode", target = "nezhaTenantCode")
    @Mapping(source = "baseFields.isDeleted", target = "isDeleted")
    @Mapping(source = "baseFields.createAt", target = "createAt")
    @Mapping(source = "baseFields.createBy", target = "createBy")
    @Mapping(source = "baseFields.createName", target = "createName")
    @Mapping(source = "baseFields.updateAt", target = "updateAt")
    @Mapping(source = "baseFields.updateBy", target = "updateBy")
    @Mapping(source = "baseFields.updateName", target = "updateName")
    SourceVideoDO to(SourceVideo entity);

    @Override
    @Mapping(target = "operator", ignore = true)
    @Mapping(target = "segments", ignore = true)
    @Mapping(source = "nezhaTenantCode", target = "baseFields.nezhaTenantCode")
    @Mapping(source = "isDeleted", target = "baseFields.isDeleted")
    @Mapping(source = "createAt", target = "baseFields.createAt")
    @Mapping(source = "createBy", target = "baseFields.createBy")
    @Mapping(source = "createName", target = "baseFields.createName")
    @Mapping(source = "updateAt", target = "baseFields.updateAt")
    @Mapping(source = "updateBy", target = "baseFields.updateBy")
    @Mapping(source = "updateName", target = "baseFields.updateName")
    SourceVideo from(SourceVideoDO entity);
}
