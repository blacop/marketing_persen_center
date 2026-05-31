package com.beukay.marketing.person.infrastructure.generator;

import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class MarkdownSkillArtifactGenerator implements SkillArtifactGenerator {

    private final ObjectMapper objectMapper;

    @Override
    public SkillArtifact generate(AgentDefinition definition, String skillId, String publishVersion, String operatorName) {
        String version = publishVersion == null || publishVersion.isBlank() ? definition.getVersion() : publishVersion;
        String skillContent = renderSkillMarkdown(definition, skillId, version);
        String checksum = sha256(skillContent);
        String metadataContent = renderMetadata(definition, skillId, version, operatorName, checksum);
        return SkillArtifact.builder()
                .skillId(skillId)
                .skillContent(skillContent)
                .metadataContent(metadataContent)
                .checksum(checksum)
                .build();
    }

    private String renderSkillMarkdown(AgentDefinition definition, String skillId, String version) {
        String description = safe(definition.getDescription(), "Generated skill from AgentDefinition");
        String businessRules = safe(definition.getBusinessRules(), "No explicit business rules.");
        String modelConfig = safe(definition.getModelConfig(), "{}\n");
        String skillIds = safe(definition.getSkillIds(), "None");
        return "---\n"
                + "name: " + skillId + "\n"
                + "description: \"" + description.replace("\"", "\\\"") + "\"\n"
                + "version: " + safe(version, "v1") + "\n"
                + "source: beukay-agent-studio\n"
                + "---\n\n"
                + "# Purpose\n"
                + description + "\n\n"
                + "# Inputs\n"
                + "- modelConfig: structured model configuration JSON\n"
                + "- businessRules: business rule constraints\n"
                + "- linkedSkills: " + skillIds + "\n\n"
                + "# Workflow\n"
                + "1. Read the agent definition and behavior DSL.\n"
                + "2. Execute the behavior deterministically according to the DSL and rules.\n"
                + "3. Return a concise result that is consistent with the configured business intent.\n\n"
                + "# Constraints\n"
                + businessRules + "\n\n"
                + "# Output\n"
                + "Return a structured response aligned with the calling workflow.\n\n"
                + "# Definition\n"
                + safe(definition.getBehaviorDsl(), "No behavior DSL configured.") + "\n\n"
                + "# Model Config\n"
                + modelConfig + "\n";
    }

    private String renderMetadata(AgentDefinition definition, String skillId, String version, String operatorName, String checksum) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("definitionId", definition.getId());
        metadata.put("definitionVersion", safe(version, "v1"));
        metadata.put("skillId", skillId);
        metadata.put("checksum", checksum);
        metadata.put("publishedAt", LocalDateTime.now().toString());
        metadata.put("publishedBy", operatorName);
        metadata.put("templateVersion", "v1");
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(metadata);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("生成metadata.json失败", e);
        }
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256不可用", e);
        }
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

}
