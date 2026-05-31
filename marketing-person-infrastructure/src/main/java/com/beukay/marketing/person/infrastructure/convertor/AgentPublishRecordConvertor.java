package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.AgentPublishRecordDO;
import com.beukay.marketing.person.domain.agentPublishRecord.model.AgentPublishRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface AgentPublishRecordConvertor extends BaseConvertor<AgentPublishRecord, AgentPublishRecordDO> {

    AgentPublishRecordConvertor INSTANCE = Mappers.getMapper(AgentPublishRecordConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "definitionId", source = "definitionId")
    @Mapping(target = "definitionVersion", source = "definitionVersion")
    @Mapping(target = "skillId", source = "skillId")
    @Mapping(target = "artifactPath", source = "artifactPath")
    @Mapping(target = "artifactChecksum", source = "artifactChecksum")
    @Mapping(target = "publisherType", source = "publisherType")
    @Mapping(target = "publishStatus", source = "publishStatus")
    @Mapping(target = "errorMsg", source = "errorMsg")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    AgentPublishRecordDO to(AgentPublishRecord agentPublishRecord);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "definitionId", source = "definitionId")
    @Mapping(target = "definitionVersion", source = "definitionVersion")
    @Mapping(target = "skillId", source = "skillId")
    @Mapping(target = "artifactPath", source = "artifactPath")
    @Mapping(target = "artifactChecksum", source = "artifactChecksum")
    @Mapping(target = "publisherType", source = "publisherType")
    @Mapping(target = "publishStatus", source = "publishStatus")
    @Mapping(target = "errorMsg", source = "errorMsg")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "operator", ignore = true)
    AgentPublishRecord from(AgentPublishRecordDO source);

}
