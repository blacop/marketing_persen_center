package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.Operator;
import com.beukay.marketing.person.client.cmd.AgentIdentityCreateCmd;
import com.beukay.marketing.person.client.cmd.AgentIdentityUpdateCmd;
import com.beukay.marketing.person.domain.agentIdentity.ability.AgentIdentityDomainService;
import com.beukay.marketing.person.domain.agentIdentity.model.AgentIdentity;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import com.beukay.ai.common.exception.GenericBusinessException;
@Log4j2
@Component
@RequiredArgsConstructor
public class AgentIdentityCmdExecutor {

    private static final Operator SYSTEM_OPERATOR = new Operator(0L, "system");

    private final AgentIdentityDomainService agentIdentityDomainService;

    public Long createAgentIdentity(AgentIdentityCreateCmd cmd) {
        AgentIdentity existing = agentIdentityDomainService.queryByAgentUniqueId(cmd.getAgentUniqueId());
        if (existing != null) {
            throw new GenericBusinessException("agentUniqueId已存在: " + cmd.getAgentUniqueId());
        }
        AgentIdentity agentIdentity = AgentIdentity.builder()
                .name(cmd.getName())
                .description(cmd.getDescription())
                .status(cmd.getStatus() == null || cmd.getStatus().isBlank() ? "ACTIVE" : cmd.getStatus())
                .agentUniqueId(cmd.getAgentUniqueId())
                .publicKey(cmd.getPublicKey())
                .authPolicy(cmd.getAuthPolicy())
                .ownerId(cmd.getOwnerId())
                .agentType(cmd.getAgentType())
                .build();
        agentIdentity.buildInsert(SYSTEM_OPERATOR);
        return agentIdentityDomainService.create(agentIdentity);
    }

    public boolean updateAgentIdentity(AgentIdentityUpdateCmd cmd) {
        AgentIdentity existing = agentIdentityDomainService.queryById(cmd.getId());
        if (existing == null) {
            throw new GenericBusinessException("AgentIdentity不存在: " + cmd.getId());
        }
        AgentIdentity duplicate = agentIdentityDomainService.queryByAgentUniqueId(cmd.getAgentUniqueId());
        if (duplicate != null && !duplicate.getId().equals(cmd.getId())) {
            throw new GenericBusinessException("agentUniqueId已存在: " + cmd.getAgentUniqueId());
        }
        existing.setName(cmd.getName());
        existing.setDescription(cmd.getDescription());
        existing.setStatus(cmd.getStatus() == null || cmd.getStatus().isBlank() ? existing.getStatus() : cmd.getStatus());
        existing.setAgentUniqueId(cmd.getAgentUniqueId());
        existing.setPublicKey(cmd.getPublicKey());
        existing.setAuthPolicy(cmd.getAuthPolicy());
        existing.setOwnerId(cmd.getOwnerId());
        existing.setAgentType(cmd.getAgentType());
        agentIdentityDomainService.update(existing);
        return true;
    }

}
