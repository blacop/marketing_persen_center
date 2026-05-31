package com.beukay.marketing.person.infrastructure.publisher;

import com.beukay.marketing.person.infrastructure.generator.SkillArtifact;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class HermesLocalSkillPublisher implements SkillPublisher {

    private static final String PROJECT_DIR_PROP = "beukay.hermes.project.skills.dir";
    private static final String RUNTIME_DIR_PROP = "beukay.hermes.runtime.skills.dir";

    @Override
    public SkillPublishResult publish(SkillArtifact artifact) {
        try {
            Path projectDir = Paths.get(System.getProperty(PROJECT_DIR_PROP, Paths.get("hermes", "generated-skills").toString()), artifact.getSkillId());
            Files.createDirectories(projectDir);
            Files.writeString(projectDir.resolve("SKILL.md"), artifact.getSkillContent(), StandardCharsets.UTF_8);
            Files.writeString(projectDir.resolve("metadata.json"), artifact.getMetadataContent(), StandardCharsets.UTF_8);

            Path runtimeBaseDir = Paths.get(System.getProperty(RUNTIME_DIR_PROP,
                    Paths.get(System.getProperty("user.home"), ".hermes", "skills", "beukay", "generated").toString()));
            Path runtimeDir = runtimeBaseDir.resolve(artifact.getSkillId());
            Files.createDirectories(runtimeDir);
            Files.writeString(runtimeDir.resolve("SKILL.md"), artifact.getSkillContent(), StandardCharsets.UTF_8);

            return SkillPublishResult.builder()
                    .projectArtifactPath(projectDir.resolve("SKILL.md").toAbsolutePath().toString())
                    .runtimeArtifactPath(runtimeDir.resolve("SKILL.md").toAbsolutePath().toString())
                    .build();
        } catch (IOException e) {
            throw new IllegalStateException("发布Skill到Hermes本地目录失败", e);
        }
    }

}
