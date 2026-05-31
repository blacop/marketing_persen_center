package com.beukay.marketing.person.infrastructure.composition.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.composition.model.MaterialClipDO;
import com.beukay.marketing.person.domain.composition.model.MaterialClip;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

/**
 * MaterialClip ↔ MaterialClipDO 转换。tags/tagsCache 由 GatewayImpl 显式处理。
 */
@Mapper(uses = BooleanStrategy.class)
public interface MaterialClipConvertor extends BaseConvertor<MaterialClip, MaterialClipDO> {

    MaterialClipConvertor INSTANCE = Mappers.getMapper(MaterialClipConvertor.class);

    @Override
    @Mapping(target = "tagsCache", ignore = true)
    @Mapping(source = "baseFields.nezhaTenantCode", target = "nezhaTenantCode")
    @Mapping(source = "baseFields.isDeleted", target = "isDeleted")
    @Mapping(source = "baseFields.createAt", target = "createAt")
    @Mapping(source = "baseFields.createBy", target = "createBy")
    @Mapping(source = "baseFields.createName", target = "createName")
    @Mapping(source = "baseFields.updateAt", target = "updateAt")
    @Mapping(source = "baseFields.updateBy", target = "updateBy")
    @Mapping(source = "baseFields.updateName", target = "updateName")
    MaterialClipDO to(MaterialClip entity);

    @Override
    @Mapping(target = "operator", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(source = "nezhaTenantCode", target = "baseFields.nezhaTenantCode")
    @Mapping(source = "isDeleted", target = "baseFields.isDeleted")
    @Mapping(source = "createAt", target = "baseFields.createAt")
    @Mapping(source = "createBy", target = "baseFields.createBy")
    @Mapping(source = "createName", target = "baseFields.createName")
    @Mapping(source = "updateAt", target = "baseFields.updateAt")
    @Mapping(source = "updateBy", target = "baseFields.updateBy")
    @Mapping(source = "updateName", target = "baseFields.updateName")
    MaterialClip from(MaterialClipDO entity);
}
