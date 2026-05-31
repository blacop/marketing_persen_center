package com.beukay.marketing.person.infrastructure.composition.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.composition.model.CompositionProjectDO;
import com.beukay.marketing.person.domain.composition.model.CompositionProject;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface CompositionProjectConvertor extends BaseConvertor<CompositionProject, CompositionProjectDO> {

    CompositionProjectConvertor INSTANCE = Mappers.getMapper(CompositionProjectConvertor.class);

    @Override
    @Mapping(target = "bgmVoiceoverIds", ignore = true) // CSV 编解码在 GatewayImpl 手工处理
    @Mapping(source = "baseFields.nezhaTenantCode", target = "nezhaTenantCode")
    @Mapping(source = "baseFields.isDeleted", target = "isDeleted")
    @Mapping(source = "baseFields.createAt", target = "createAt")
    @Mapping(source = "baseFields.createBy", target = "createBy")
    @Mapping(source = "baseFields.createName", target = "createName")
    @Mapping(source = "baseFields.updateAt", target = "updateAt")
    @Mapping(source = "baseFields.updateBy", target = "updateBy")
    @Mapping(source = "baseFields.updateName", target = "updateName")
    CompositionProjectDO to(CompositionProject entity);

    @Override
    @Mapping(target = "operator", ignore = true)
    @Mapping(target = "chapters", ignore = true)
    @Mapping(target = "bgmVoiceoverIds", ignore = true) // CSV 编解码在 GatewayImpl 手工处理
    @Mapping(source = "nezhaTenantCode", target = "baseFields.nezhaTenantCode")
    @Mapping(source = "isDeleted", target = "baseFields.isDeleted")
    @Mapping(source = "createAt", target = "baseFields.createAt")
    @Mapping(source = "createBy", target = "baseFields.createBy")
    @Mapping(source = "createName", target = "baseFields.createName")
    @Mapping(source = "updateAt", target = "baseFields.updateAt")
    @Mapping(source = "updateBy", target = "baseFields.updateBy")
    @Mapping(source = "updateName", target = "baseFields.updateName")
    CompositionProject from(CompositionProjectDO entity);
}
