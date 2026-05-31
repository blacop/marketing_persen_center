package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.Operator;
import com.beukay.marketing.person.client.cmd.AgentDefinitionCreateCmd;
import com.beukay.marketing.person.domain.agentDefinition.ability.AgentDefinitionDomainService;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import com.beukay.ai.common.exception.GenericBusinessException;
@Log4j2
@Component
@RequiredArgsConstructor
public class AgentDefinitionCmdExecutor {

    private static final Operator SYSTEM_OPERATOR = new Operator(0L, "system");

    private final AgentDefinitionDomainService agentDefinitionDomainService;

    public Long createAgentDefinition(AgentDefinitionCreateCmd cmd) {
        AgentDefinition existing = agentDefinitionDomainService.queryByAgentDefId(cmd.getAgentDefId());
        if (existing != null) {
            throw new GenericBusinessException("agentDefId已存在: " + cmd.getAgentDefId());
        }
        AgentDefinition agentDefinition = AgentDefinition.builder()
                .name(cmd.getName())
                .description(cmd.getDescription())
                .status(cmd.getStatus() == null || cmd.getStatus().isBlank() ? "ACTIVE" : cmd.getStatus())
                .agentDefId(cmd.getAgentDefId())
                .behaviorDsl(cmd.getBehaviorDsl())
                .modelConfig(cmd.getModelConfig())
                .businessRules(cmd.getBusinessRules())
                .skillIds(cmd.getSkillIds())
                .version(cmd.getVersion() == null || cmd.getVersion().isBlank() ? "v1" : cmd.getVersion())
                .publishStatus("DRAFT")
                .build();
        agentDefinition.buildInsert(SYSTEM_OPERATOR);
        return agentDefinitionDomainService.create(agentDefinition);
    }

}
