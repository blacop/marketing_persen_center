package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.SkillRegistryDO;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface SkillRegistryConvertor extends BaseConvertor<SkillRegistry, SkillRegistryDO> {

    SkillRegistryConvertor INSTANCE = Mappers.getMapper(SkillRegistryConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "skillId", source = "skillId")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "source", source = "source")
    @Mapping(target = "mcpEndpoint", source = "mcpEndpoint")
    @Mapping(target = "inputSchema", source = "inputSchema")
    @Mapping(target = "trustLevel", source = "trustLevel")
    @Mapping(target = "version", source = "version")
    @Mapping(target = "artifactPath", source = "artifactPath")
    @Mapping(target = "artifactChecksum", source = "artifactChecksum")
    @Mapping(target = "schemaVersion", source = "schemaVersion")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    SkillRegistryDO to(SkillRegistry skillRegistry);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "skillId", source = "skillId")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "source", source = "source")
    @Mapping(target = "mcpEndpoint", source = "mcpEndpoint")
    @Mapping(target = "inputSchema", source = "inputSchema")
    @Mapping(target = "trustLevel", source = "trustLevel")
    @Mapping(target = "version", source = "version")
    @Mapping(target = "artifactPath", source = "artifactPath")
    @Mapping(target = "artifactChecksum", source = "artifactChecksum")
    @Mapping(target = "schemaVersion", source = "schemaVersion")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "operator", ignore = true)
    SkillRegistry from(SkillRegistryDO doSkillRegistry);

}
