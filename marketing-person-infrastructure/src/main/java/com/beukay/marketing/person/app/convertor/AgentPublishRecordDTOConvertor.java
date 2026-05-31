package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.AgentPublishRecordDTO;
import com.beukay.marketing.person.domain.agentPublishRecord.model.AgentPublishRecord;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface AgentPublishRecordDTOConvertor {

    AgentPublishRecordDTOConvertor INSTANCE = Mappers.getMapper(AgentPublishRecordDTOConvertor.class);

    default AgentPublishRecordDTO convert(AgentPublishRecord record) {
        return AgentPublishRecordDTO.builder()
                .id(record.getId())
                .definitionId(record.getDefinitionId())
                .definitionVersion(record.getDefinitionVersion())
                .skillId(record.getSkillId())
                .artifactPath(record.getArtifactPath())
                .artifactChecksum(record.getArtifactChecksum())
                .publisherType(record.getPublisherType())
                .publishStatus(record.getPublishStatus())
                .errorMsg(record.getErrorMsg())
                .createAt(record.getBaseFields() != null ? record.getBaseFields().getCreateAt() : null)
                .createName(record.getBaseFields() != null ? record.getBaseFields().getCreateName() : null)
                .build();
    }

}
