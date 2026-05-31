package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.Operator;
import com.beukay.marketing.person.client.cmd.AgentRegistryCreateCmd;
import com.beukay.marketing.person.client.cmd.AgentRegistryUpdateCmd;
import com.beukay.marketing.person.domain.agentRegistry.ability.AgentRegistryDomainService;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import com.beukay.ai.common.exception.GenericBusinessException;
@Log4j2
@Component
@RequiredArgsConstructor
public class AgentRegistryCmdExecutor {

    private static final Operator SYSTEM_OPERATOR = new Operator(0L, "system");

    private final AgentRegistryDomainService agentRegistryDomainService;

    public Long createAgentRegistry(AgentRegistryCreateCmd cmd) {
        AgentRegistry existing = agentRegistryDomainService.queryByAgentUniqueId(cmd.getAgentUniqueId());
        if (existing != null) {
            throw new GenericBusinessException("agentUniqueId已存在: " + cmd.getAgentUniqueId());
        }
        AgentRegistry agentRegistry = AgentRegistry.builder()
                .name(cmd.getName())
                .description(cmd.getDescription())
                .status(cmd.getStatus() == null || cmd.getStatus().isBlank() ? "ACTIVE" : cmd.getStatus())
                .agentUniqueId(cmd.getAgentUniqueId())
                .category(cmd.getCategory())
                .endpointUrl(cmd.getEndpointUrl())
                .agentType(cmd.getAgentType())
                .version(cmd.getVersion())
                .ownerId(cmd.getOwnerId())
                .build();
        agentRegistry.buildInsert(SYSTEM_OPERATOR);
        return agentRegistryDomainService.create(agentRegistry);
    }

    public boolean updateAgentRegistry(AgentRegistryUpdateCmd cmd) {
        AgentRegistry existing = agentRegistryDomainService.queryById(cmd.getId());
        if (existing == null) {
            throw new GenericBusinessException("AgentRegistry不存在: " + cmd.getId());
        }
        if (cmd.getAgentUniqueId() != null && !cmd.getAgentUniqueId().isBlank()) {
            AgentRegistry duplicate = agentRegistryDomainService.queryByAgentUniqueId(cmd.getAgentUniqueId());
            if (duplicate != null && !duplicate.getId().equals(cmd.getId())) {
                throw new GenericBusinessException("agentUniqueId已存在: " + cmd.getAgentUniqueId());
            }
            existing.setAgentUniqueId(cmd.getAgentUniqueId());
        }
        existing.setName(cmd.getName());
        existing.setDescription(cmd.getDescription());
        existing.setStatus(cmd.getStatus() == null || cmd.getStatus().isBlank() ? existing.getStatus() : cmd.getStatus());
        existing.setCategory(cmd.getCategory());
        existing.setEndpointUrl(cmd.getEndpointUrl());
        existing.setAgentType(cmd.getAgentType());
        existing.setVersion(cmd.getVersion());
        existing.setOwnerId(cmd.getOwnerId());
        agentRegistryDomainService.update(existing);
        return true;
    }

    public boolean updateStatus(Long id, String status) {
        AgentRegistry existing = agentRegistryDomainService.queryById(id);
        if (existing == null) {
            throw new GenericBusinessException("AgentRegistry不存在: " + id);
        }
        existing.setStatus(status);
        agentRegistryDomainService.update(existing);
        return true;
    }

}
