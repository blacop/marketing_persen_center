package com.beukay.marketing.person.infrastructure.generator;

import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MarkdownSkillArtifactGeneratorTest {

    @Test
    void shouldGenerateDeterministicSkillArtifact() {
        MarkdownSkillArtifactGenerator generator = new MarkdownSkillArtifactGenerator(new ObjectMapper());
        AgentDefinition definition = AgentDefinition.builder()
                .id(1L)
                .name("Content Reviewer")
                .description("Review marketing content")
                .agentDefId("content-reviewer")
                .behaviorDsl("Check content against policy and return verdict")
                .modelConfig("{\"model\":\"gpt-5\"}")
                .businessRules("Must reject unsafe content.")
                .skillIds("policy-check,brand-check")
                .version("v1")
                .build();

        SkillArtifact artifact = generator.generate(definition, "content-reviewer-v1", "v1", "system");

        assertNotNull(artifact.getChecksum());
        assertTrue(artifact.getSkillContent().contains("name: content-reviewer-v1"));
        assertTrue(artifact.getSkillContent().contains("# Workflow"));
        assertTrue(artifact.getMetadataContent().contains("\"definitionId\" : 1"));
    }
}
