package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.SkillRegistryDTO;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistry;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface SkillRegistryDTOConvertor {

    SkillRegistryDTOConvertor INSTANCE = Mappers.getMapper(SkillRegistryDTOConvertor.class);

    default SkillRegistryDTO convert(SkillRegistry skillRegistry) {
        return SkillRegistryDTO.builder()
                .id(skillRegistry.getId())
                .name(skillRegistry.getName())
                .description(skillRegistry.getDescription())
                .status(skillRegistry.getStatus())
                .skillId(skillRegistry.getSkillId())
                .category(skillRegistry.getCategory())
                .source(skillRegistry.getSource())
                .mcpEndpoint(skillRegistry.getMcpEndpoint())
                .inputSchema(skillRegistry.getInputSchema())
                .trustLevel(skillRegistry.getTrustLevel())
                .version(skillRegistry.getVersion())
                .artifactPath(skillRegistry.getArtifactPath())
                .artifactChecksum(skillRegistry.getArtifactChecksum())
                .schemaVersion(skillRegistry.getSchemaVersion())
                .createAt(skillRegistry.getBaseFields() != null ? skillRegistry.getBaseFields().getCreateAt() : null)
                .createName(skillRegistry.getBaseFields() != null ? skillRegistry.getBaseFields().getCreateName() : null)
                .build();
    }

}
