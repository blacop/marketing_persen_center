package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.CmCollectionDO;
import com.beukay.marketing.person.domain.cutmatrix.collection.model.CmCollection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface CmCollectionConvertor extends BaseConvertor<CmCollection, CmCollectionDO> {

    CmCollectionConvertor INSTANCE = Mappers.getMapper(CmCollectionConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "collectionCode", source = "collectionCode")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "mode", source = "mode")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    CmCollectionDO to(CmCollection source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "collectionCode", source = "collectionCode")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "mode", source = "mode")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "operator", ignore = true)
    CmCollection from(CmCollectionDO source);
}
