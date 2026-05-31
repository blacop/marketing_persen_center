package com.beukay.marketing.person.infrastructure.publisher;

import com.beukay.marketing.person.infrastructure.generator.SkillArtifact;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class HermesLocalSkillPublisherTest {

    @TempDir
    Path tempDir;

    @Test
    void shouldPublishToProjectAndRuntimeDirectories() throws Exception {
        System.setProperty("beukay.hermes.project.skills.dir", tempDir.resolve("project-skills").toString());
        System.setProperty("beukay.hermes.runtime.skills.dir", tempDir.resolve("runtime-skills").toString());
        try {
            HermesLocalSkillPublisher publisher = new HermesLocalSkillPublisher();
            SkillArtifact artifact = SkillArtifact.builder()
                    .skillId("demo-skill")
                    .skillContent("# demo")
                    .metadataContent("{}")
                    .checksum("abc")
                    .build();

            SkillPublishResult result = publisher.publish(artifact);

            assertTrue(Files.exists(Path.of(result.getProjectArtifactPath())));
            assertTrue(Files.exists(Path.of(result.getRuntimeArtifactPath())));
        } finally {
            System.clearProperty("beukay.hermes.project.skills.dir");
            System.clearProperty("beukay.hermes.runtime.skills.dir");
        }
    }
}
