package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.client.cmd.AgentDefinitionUpdateCmd;
import com.beukay.marketing.person.domain.agentDefinition.ability.AgentDefinitionDomainService;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import com.beukay.ai.common.exception.GenericBusinessException;
@Log4j2
@Component
@RequiredArgsConstructor
public class AgentDefinitionUpdateCmdExecutor {

    private final AgentDefinitionDomainService agentDefinitionDomainService;

    public boolean updateAgentDefinition(AgentDefinitionUpdateCmd cmd) {
        AgentDefinition existing = agentDefinitionDomainService.queryById(cmd.getId());
        if (existing == null) {
            throw new GenericBusinessException("AgentDefinition不存在: " + cmd.getId());
        }
        AgentDefinition duplicate = agentDefinitionDomainService.queryByAgentDefId(cmd.getAgentDefId());
        if (duplicate != null && !duplicate.getId().equals(cmd.getId())) {
            throw new GenericBusinessException("agentDefId已存在: " + cmd.getAgentDefId());
        }
        existing.setName(cmd.getName());
        existing.setDescription(cmd.getDescription());
        existing.setStatus(cmd.getStatus() == null || cmd.getStatus().isBlank() ? existing.getStatus() : cmd.getStatus());
        existing.setAgentDefId(cmd.getAgentDefId());
        existing.setBehaviorDsl(cmd.getBehaviorDsl());
        existing.setModelConfig(cmd.getModelConfig());
        existing.setBusinessRules(cmd.getBusinessRules());
        existing.setSkillIds(cmd.getSkillIds());
        existing.setVersion(cmd.getVersion() == null || cmd.getVersion().isBlank() ? existing.getVersion() : cmd.getVersion());
        existing.setPublishStatus("DRAFT");
        agentDefinitionDomainService.update(existing);
        return true;
    }

}
