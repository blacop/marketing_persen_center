package com.beukay.marketing.person.infrastructure.composition.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.composition.model.MaterialFolderDO;
import com.beukay.marketing.person.domain.composition.model.MaterialFolder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface MaterialFolderConvertor extends BaseConvertor<MaterialFolder, MaterialFolderDO> {

    MaterialFolderConvertor INSTANCE = Mappers.getMapper(MaterialFolderConvertor.class);

    @Override
    @Mapping(source = "baseFields.nezhaTenantCode", target = "nezhaTenantCode")
    @Mapping(source = "baseFields.isDeleted", target = "isDeleted")
    @Mapping(source = "baseFields.createAt", target = "createAt")
    @Mapping(source = "baseFields.createBy", target = "createBy")
    @Mapping(source = "baseFields.createName", target = "createName")
    @Mapping(source = "baseFields.updateAt", target = "updateAt")
    @Mapping(source = "baseFields.updateBy", target = "updateBy")
    @Mapping(source = "baseFields.updateName", target = "updateName")
    MaterialFolderDO to(MaterialFolder entity);

    @Override
    @Mapping(target = "operator", ignore = true)
    @Mapping(source = "nezhaTenantCode", target = "baseFields.nezhaTenantCode")
    @Mapping(source = "isDeleted", target = "baseFields.isDeleted")
    @Mapping(source = "createAt", target = "baseFields.createAt")
    @Mapping(source = "createBy", target = "baseFields.createBy")
    @Mapping(source = "createName", target = "baseFields.createName")
    @Mapping(source = "updateAt", target = "baseFields.updateAt")
    @Mapping(source = "updateBy", target = "baseFields.updateBy")
    @Mapping(source = "updateName", target = "baseFields.updateName")
    MaterialFolder from(MaterialFolderDO entity);
}
