package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.client.dto.AgentDefinitionPublishDTO;
import com.beukay.marketing.person.domain.agentDefinition.gateway.AgentDefinitionGateway;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinitionListCriteriaQuery;
import com.beukay.marketing.person.domain.agentPublishRecord.gateway.AgentPublishRecordGateway;
import com.beukay.marketing.person.domain.agentPublishRecord.model.AgentPublishRecord;
import com.beukay.marketing.person.domain.agentPublishRecord.model.AgentPublishRecordListCriteriaQuery;
import com.beukay.marketing.person.domain.agentRegistry.gateway.AgentRegistryGateway;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistry;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistryListCriteriaQuery;
import com.beukay.marketing.person.domain.agentTrace.gateway.AgentTraceGateway;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTrace;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTraceListCriteriaQuery;
import com.beukay.marketing.person.domain.skillRegistry.gateway.SkillRegistryGateway;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistry;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistryListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.generator.SkillArtifact;
import com.beukay.marketing.person.infrastructure.generator.SkillArtifactGenerator;
import com.beukay.marketing.person.infrastructure.publisher.SkillPublishResult;
import com.beukay.marketing.person.infrastructure.publisher.SkillPublisher;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AgentPublishAppServiceTest {

    @Test
    void shouldPublishDefinitionAndWriteRegistriesAndTrace() {
        InMemoryAgentDefinitionGateway definitionGateway = new InMemoryAgentDefinitionGateway();
        InMemoryAgentTraceGateway traceGateway = new InMemoryAgentTraceGateway();
        InMemorySkillRegistryGateway skillRegistryGateway = new InMemorySkillRegistryGateway();
        InMemoryAgentRegistryGateway agentRegistryGateway = new InMemoryAgentRegistryGateway();
        InMemoryAgentPublishRecordGateway publishRecordGateway = new InMemoryAgentPublishRecordGateway();

        AgentDefinition definition = AgentDefinition.builder()
                .id(1L)
                .name("Demo Agent")
                .description("Demo")
                .status("ACTIVE")
                .agentDefId("demo-agent")
                .behaviorDsl("Do demo work")
                .version("v1")
                .publishStatus("DRAFT")
                .build();
        definitionGateway.store.put(1L, definition);

        SkillArtifactGenerator generator = (def, skillId, version, operatorName) -> SkillArtifact.builder()
                .skillId(skillId)
                .skillContent("content")
                .metadataContent("{}")
                .checksum("checksum")
                .build();
        SkillPublisher publisher = artifact -> SkillPublishResult.builder()
                .projectArtifactPath("/tmp/project/" + artifact.getSkillId())
                .runtimeArtifactPath("/tmp/runtime/" + artifact.getSkillId())
                .build();

        AgentPublishAppService service = new AgentPublishAppService(
                definitionGateway, traceGateway, skillRegistryGateway, agentRegistryGateway,
                publishRecordGateway, generator, publisher);

        AgentDefinitionPublishDTO result = service.publish(1L, null);

        assertEquals("PUBLISHED", result.getPublishStatus());
        assertNotNull(result.getPublishRecordId());
        assertEquals("PUBLISHED", definitionGateway.store.get(1L).getPublishStatus());
        assertEquals(1, skillRegistryGateway.store.size());
        assertEquals(1, agentRegistryGateway.store.size());
        assertEquals(1, publishRecordGateway.store.size());
        assertEquals("SUCCESS", traceGateway.store.get(1L).getTraceStatus());
    }

    @Test
    void shouldMarkDefinitionFailedWhenPublishThrows() {
        InMemoryAgentDefinitionGateway definitionGateway = new InMemoryAgentDefinitionGateway();
        InMemoryAgentTraceGateway traceGateway = new InMemoryAgentTraceGateway();
        InMemorySkillRegistryGateway skillRegistryGateway = new InMemorySkillRegistryGateway();
        InMemoryAgentRegistryGateway agentRegistryGateway = new InMemoryAgentRegistryGateway();
        InMemoryAgentPublishRecordGateway publishRecordGateway = new InMemoryAgentPublishRecordGateway();

        AgentDefinition definition = AgentDefinition.builder()
                .id(2L)
                .name("Fail Agent")
                .description("Fail")
                .status("ACTIVE")
                .agentDefId("fail-agent")
                .behaviorDsl("Do fail work")
                .version("v1")
                .publishStatus("DRAFT")
                .build();
        definitionGateway.store.put(2L, definition);

        SkillArtifactGenerator generator = (def, skillId, version, operatorName) -> SkillArtifact.builder()
                .skillId(skillId)
                .skillContent("content")
                .metadataContent("{}")
                .checksum("checksum")
                .build();
        SkillPublisher publisher = artifact -> {
            throw new IllegalStateException("boom");
        };

        AgentPublishAppService service = new AgentPublishAppService(
                definitionGateway, traceGateway, skillRegistryGateway, agentRegistryGateway,
                publishRecordGateway, generator, publisher);

        assertThrows(IllegalStateException.class, () -> service.publish(2L, null));
        assertEquals("FAILED", definitionGateway.store.get(2L).getPublishStatus());
        assertEquals("FAILED", traceGateway.store.get(1L).getTraceStatus());
        assertEquals("FAILED", publishRecordGateway.store.get(1L).getPublishStatus());
    }

    private static class InMemoryAgentDefinitionGateway implements AgentDefinitionGateway {
        private final Map<Long, AgentDefinition> store = new HashMap<>();
        @Override public Long create(AgentDefinition agentDefinition) { store.put(agentDefinition.getId(), agentDefinition); return agentDefinition.getId(); }
        @Override public void update(AgentDefinition agentDefinition) { store.put(agentDefinition.getId(), agentDefinition); }
        @Override public AgentDefinition queryById(Long id) { return store.get(id); }
        @Override public AgentDefinition queryByName(String name) { return store.values().stream().filter(v -> name.equals(v.getName())).findFirst().orElse(null); }
        @Override public AgentDefinition queryByAgentDefId(String agentDefId) { return store.values().stream().filter(v -> agentDefId.equals(v.getAgentDefId())).findFirst().orElse(null); }
        @Override public PageInfo<AgentDefinition> listPage(AgentDefinitionListCriteriaQuery criteriaQuery, PageQuery pageQuery) { return new PageInfo<>(); }
    }

    private static class InMemoryAgentTraceGateway implements AgentTraceGateway {
        private final Map<Long, AgentTrace> store = new HashMap<>();
        private final AtomicLong seq = new AtomicLong(1);
        @Override public Long create(AgentTrace agentTrace) { long id = seq.getAndIncrement(); agentTrace.setId(id); if (agentTrace.getStartAt() == null) agentTrace.setStartAt(LocalDateTime.now()); store.put(id, agentTrace); return id; }
        @Override public void update(AgentTrace agentTrace) { store.put(agentTrace.getId(), agentTrace); }
        @Override public AgentTrace queryById(Long id) { return store.get(id); }
        @Override public AgentTrace queryByName(String name) { return null; }
        @Override public PageInfo<AgentTrace> listPage(AgentTraceListCriteriaQuery criteriaQuery, PageQuery pageQuery) { return new PageInfo<>(); }
    }

    private static class InMemorySkillRegistryGateway implements SkillRegistryGateway {
        private final Map<Long, SkillRegistry> store = new HashMap<>();
        private final AtomicLong seq = new AtomicLong(1);
        @Override public Long create(SkillRegistry skillRegistry) { long id = seq.getAndIncrement(); skillRegistry.setId(id); store.put(id, skillRegistry); return id; }
        @Override public void update(SkillRegistry skillRegistry) { store.put(skillRegistry.getId(), skillRegistry); }
        @Override public SkillRegistry queryById(Long id) { return store.get(id); }
        @Override public SkillRegistry queryBySkillId(String skillId) { return store.values().stream().filter(v -> skillId.equals(v.getSkillId())).findFirst().orElse(null); }
        @Override public PageInfo<SkillRegistry> listPage(SkillRegistryListCriteriaQuery criteriaQuery, PageQuery pageQuery) { return new PageInfo<>(); }
    }

    private static class InMemoryAgentRegistryGateway implements AgentRegistryGateway {
        private final Map<Long, AgentRegistry> store = new HashMap<>();
        private final AtomicLong seq = new AtomicLong(1);
        @Override public Long create(AgentRegistry agentRegistry) { long id = seq.getAndIncrement(); agentRegistry.setId(id); store.put(id, agentRegistry); return id; }
        @Override public void update(AgentRegistry agentRegistry) { store.put(agentRegistry.getId(), agentRegistry); }
        @Override public AgentRegistry queryById(Long id) { return store.get(id); }
        @Override public AgentRegistry queryByName(String name) { return null; }
        @Override public AgentRegistry queryByAgentUniqueId(String agentUniqueId) { return store.values().stream().filter(v -> agentUniqueId.equals(v.getAgentUniqueId())).findFirst().orElse(null); }
        @Override public PageInfo<AgentRegistry> listPage(AgentRegistryListCriteriaQuery criteriaQuery, PageQuery pageQuery) { return new PageInfo<>(); }
    }

    private static class InMemoryAgentPublishRecordGateway implements AgentPublishRecordGateway {
        private final Map<Long, AgentPublishRecord> store = new HashMap<>();
        private final AtomicLong seq = new AtomicLong(1);
        @Override public Long create(AgentPublishRecord record) { long id = seq.getAndIncrement(); record.setId(id); store.put(id, record); return id; }
        @Override public void update(AgentPublishRecord record) { store.put(record.getId(), record); }
        @Override public AgentPublishRecord queryById(Long id) { return store.get(id); }
        @Override public PageInfo<AgentPublishRecord> listPage(AgentPublishRecordListCriteriaQuery criteriaQuery, PageQuery pageQuery) { return new PageInfo<>(); }
    }
}
