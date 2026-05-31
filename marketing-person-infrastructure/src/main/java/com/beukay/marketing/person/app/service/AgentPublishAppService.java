package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.Operator;
import com.beukay.marketing.person.client.dto.AgentDefinitionPublishDTO;
import com.beukay.marketing.person.domain.agentDefinition.gateway.AgentDefinitionGateway;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import com.beukay.marketing.person.domain.agentPublishRecord.gateway.AgentPublishRecordGateway;
import com.beukay.marketing.person.domain.agentPublishRecord.model.AgentPublishRecord;
import com.beukay.marketing.person.domain.agentRegistry.gateway.AgentRegistryGateway;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistry;
import com.beukay.marketing.person.domain.agentTrace.gateway.AgentTraceGateway;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTrace;
import com.beukay.marketing.person.domain.skillRegistry.gateway.SkillRegistryGateway;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistry;
import com.beukay.marketing.person.infrastructure.generator.SkillArtifact;
import com.beukay.marketing.person.infrastructure.generator.SkillArtifactGenerator;
import com.beukay.marketing.person.infrastructure.publisher.SkillPublishResult;
import com.beukay.marketing.person.infrastructure.publisher.SkillPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

import com.beukay.ai.common.exception.GenericBusinessException;
@Service
@RequiredArgsConstructor
public class AgentPublishAppService {

    private static final Operator SYSTEM_OPERATOR = new Operator(0L, "system");

    private final AgentDefinitionGateway agentDefinitionGateway;
    private final AgentTraceGateway agentTraceGateway;
    private final SkillRegistryGateway skillRegistryGateway;
    private final AgentRegistryGateway agentRegistryGateway;
    private final AgentPublishRecordGateway agentPublishRecordGateway;
    private final SkillArtifactGenerator skillArtifactGenerator;
    private final SkillPublisher skillPublisher;

    @Transactional(rollbackFor = Exception.class)
    public AgentDefinitionPublishDTO publish(Long definitionId, String publishVersion) {
        AgentDefinition definition = requireDefinition(definitionId);
        return doPublish(definition, publishVersion, false);
    }

    @Transactional(rollbackFor = Exception.class)
    public AgentDefinitionPublishDTO retryPublish(Long definitionId) {
        AgentDefinition definition = requireDefinition(definitionId);
        return doPublish(definition, definition.getVersion(), true);
    }

    private AgentDefinitionPublishDTO doPublish(AgentDefinition definition, String publishVersion, boolean retry) {
        String traceId = UUID.randomUUID().toString();
        LocalDateTime startedAt = LocalDateTime.now();
        String skillId = buildSkillId(definition, publishVersion);
        AgentTrace trace = AgentTrace.builder()
                .name(retry ? "Retry Publish AgentDefinition" : "Publish AgentDefinition")
                .description(definition.getDescription())
                .status("ACTIVE")
                .traceId(traceId)
                .agentId(definition.getAgentDefId())
                .taskDescription("Publish AgentDefinition to Hermes local skills")
                .traceType("PUBLISH")
                .traceStatus("RUNNING")
                .definitionId(definition.getId())
                .startAt(startedAt)
                .build();
        trace.buildInsert(SYSTEM_OPERATOR);
        Long traceRowId = agentTraceGateway.create(trace);

        AgentPublishRecord publishRecord = null;
        Long registryId = null;
        try {
            String targetVersion = publishVersion == null || publishVersion.isBlank() ? normalizeVersion(definition.getVersion()) : publishVersion;
            definition.setVersion(targetVersion);
            SkillArtifact artifact = skillArtifactGenerator.generate(definition, skillId, targetVersion, SYSTEM_OPERATOR.getOperatorName());
            SkillPublishResult publishResult = skillPublisher.publish(artifact);

            SkillRegistry skillRegistry = upsertSkillRegistry(definition, skillId, artifact, publishResult, targetVersion);
            AgentRegistry agentRegistry = upsertAgentRegistry(definition, skillId, targetVersion, publishResult);
            registryId = agentRegistry.getId();

            publishRecord = AgentPublishRecord.builder()
                    .definitionId(definition.getId())
                    .definitionVersion(targetVersion)
                    .skillId(skillId)
                    .artifactPath(publishResult.getRuntimeArtifactPath())
                    .artifactChecksum(artifact.getChecksum())
                    .publisherType("HERMES_LOCAL")
                    .publishStatus("SUCCESS")
                    .build();
            publishRecord.buildInsert(SYSTEM_OPERATOR);
            Long publishRecordId = agentPublishRecordGateway.create(publishRecord);

            definition.setPublishStatus("PUBLISHED");
            definition.setLastPublishAt(LocalDateTime.now());
            definition.setLastPublishBy(SYSTEM_OPERATOR.getOperatorId());
            agentDefinitionGateway.update(definition);

            trace.setId(traceRowId);
            trace.setTraceStatus("SUCCESS");
            trace.setRegistryId(registryId);
            trace.setPublishRecordId(publishRecordId);
            trace.setEndAt(LocalDateTime.now());
            trace.setDuration(Duration.between(startedAt, trace.getEndAt()).toMillis());
            trace.setResult("Published skill to Hermes local directory");
            agentTraceGateway.update(trace);

            return AgentDefinitionPublishDTO.builder()
                    .publishRecordId(publishRecordId)
                    .traceId(traceId)
                    .skillId(skillId)
                    .agentRegistryId(registryId)
                    .publishStatus("PUBLISHED")
                    .build();
        } catch (Exception ex) {
            AgentPublishRecord failedRecord = AgentPublishRecord.builder()
                    .definitionId(definition.getId())
                    .definitionVersion(normalizeVersion(publishVersion == null || publishVersion.isBlank() ? definition.getVersion() : publishVersion))
                    .skillId(skillId)
                    .artifactPath(null)
                    .artifactChecksum(null)
                    .publisherType("HERMES_LOCAL")
                    .publishStatus("FAILED")
                    .errorMsg(ex.getMessage())
                    .build();
            failedRecord.buildInsert(SYSTEM_OPERATOR);
            Long failedRecordId = agentPublishRecordGateway.create(failedRecord);

            definition.setPublishStatus("FAILED");
            agentDefinitionGateway.update(definition);

            trace.setId(traceRowId);
            trace.setTraceStatus("FAILED");
            trace.setRegistryId(registryId);
            trace.setPublishRecordId(failedRecordId);
            trace.setEndAt(LocalDateTime.now());
            trace.setDuration(Duration.between(startedAt, trace.getEndAt()).toMillis());
            trace.setErrorMsg(ex.getMessage());
            trace.setResult("Publish failed");
            agentTraceGateway.update(trace);
            throw ex;
        }
    }

    private SkillRegistry upsertSkillRegistry(AgentDefinition definition, String skillId, SkillArtifact artifact,
                                              SkillPublishResult publishResult, String version) {
        SkillRegistry existing = skillRegistryGateway.queryBySkillId(skillId);
        SkillRegistry skillRegistry = existing == null ? SkillRegistry.builder().build() : existing;
        skillRegistry.setName(definition.getName());
        skillRegistry.setDescription(definition.getDescription());
        skillRegistry.setStatus("ACTIVE");
        skillRegistry.setSkillId(skillId);
        skillRegistry.setCategory("agent-generated");
        skillRegistry.setSource("LOCAL");
        skillRegistry.setInputSchema(definition.getModelConfig());
        skillRegistry.setTrustLevel("INTERNAL");
        skillRegistry.setVersion(version);
        skillRegistry.setArtifactPath(publishResult.getRuntimeArtifactPath());
        skillRegistry.setArtifactChecksum(artifact.getChecksum());
        skillRegistry.setSchemaVersion("v1");
        if (existing == null) {
            skillRegistry.buildInsert(SYSTEM_OPERATOR);
            Long id = skillRegistryGateway.create(skillRegistry);
            skillRegistry.setId(id);
        } else {
            skillRegistryGateway.update(skillRegistry);
        }
        return skillRegistry;
    }

    private AgentRegistry upsertAgentRegistry(AgentDefinition definition, String skillId, String version,
                                              SkillPublishResult publishResult) {
        AgentRegistry existing = agentRegistryGateway.queryByAgentUniqueId(definition.getAgentDefId());
        AgentRegistry registry = existing == null ? AgentRegistry.builder().build() : existing;
        registry.setName(definition.getName());
        registry.setDescription(definition.getDescription());
        registry.setStatus("ACTIVE");
        registry.setAgentUniqueId(definition.getAgentDefId());
        registry.setCategory("agent-generated");
        registry.setEndpointUrl(publishResult.getRuntimeArtifactPath());
        registry.setAgentType("MACHINE");
        registry.setVersion(version);
        registry.setOwnerId("system");
        registry.setDefinitionId(definition.getId());
        registry.setDefinitionVersion(version);
        registry.setCurrentSkillId(skillId);
        registry.setEndpointType("HERMES_SKILL");
        if (existing == null) {
            registry.buildInsert(SYSTEM_OPERATOR);
            Long id = agentRegistryGateway.create(registry);
            registry.setId(id);
        } else {
            agentRegistryGateway.update(registry);
        }
        return registry;
    }

    private AgentDefinition requireDefinition(Long definitionId) {
        AgentDefinition definition = agentDefinitionGateway.queryById(definitionId);
        if (definition == null) {
            throw new GenericBusinessException("AgentDefinition不存在: " + definitionId);
        }
        if (definition.getBehaviorDsl() == null || definition.getBehaviorDsl().isBlank()) {
            throw new GenericBusinessException("AgentDefinition缺少behaviorDsl，无法发布");
        }
        if (definition.getAgentDefId() == null || definition.getAgentDefId().isBlank()) {
            throw new GenericBusinessException("AgentDefinition缺少agentDefId，无法发布");
        }
        return definition;
    }

    private String buildSkillId(AgentDefinition definition, String publishVersion) {
        String version = normalizeVersion(publishVersion == null || publishVersion.isBlank() ? definition.getVersion() : publishVersion);
        String raw = (definition.getAgentDefId() == null || definition.getAgentDefId().isBlank())
                ? "agent-definition-" + definition.getId()
                : definition.getAgentDefId();
        return raw.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9-]+", "-") + "-" + version.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9-]+", "-");
    }

    private String normalizeVersion(String version) {
        return version == null || version.isBlank() ? "v1" : version;
    }

}
