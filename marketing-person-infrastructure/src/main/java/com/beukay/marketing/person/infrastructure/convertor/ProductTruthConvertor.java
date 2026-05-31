package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.ProductTruthDO;
import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface ProductTruthConvertor extends BaseConvertor<ProductTruth, ProductTruthDO> {

    ProductTruthConvertor INSTANCE = Mappers.getMapper(ProductTruthConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "productName", source = "productName")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "priceRange", source = "priceRange")
    @Mapping(target = "coreBenefits", source = "coreBenefits")
    @Mapping(target = "evidencePoints", source = "evidencePoints")
    @Mapping(target = "targetSkinType", source = "targetSkinType")
    @Mapping(target = "forbiddenClaims", source = "forbiddenClaims")
    @Mapping(target = "promotionMechanisms", source = "promotionMechanisms")
    @Mapping(target = "preferredScenes", source = "preferredScenes")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    ProductTruthDO to(ProductTruth source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "productName", source = "productName")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "priceRange", source = "priceRange")
    @Mapping(target = "coreBenefits", source = "coreBenefits")
    @Mapping(target = "evidencePoints", source = "evidencePoints")
    @Mapping(target = "targetSkinType", source = "targetSkinType")
    @Mapping(target = "forbiddenClaims", source = "forbiddenClaims")
    @Mapping(target = "promotionMechanisms", source = "promotionMechanisms")
    @Mapping(target = "preferredScenes", source = "preferredScenes")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "operator", ignore = true)
    ProductTruth from(ProductTruthDO source);
}
