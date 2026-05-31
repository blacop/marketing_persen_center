package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.domain.agentDefinition.ability.AgentDefinitionDomainService;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import com.beukay.ai.common.exception.GenericBusinessException;
@Log4j2
@Component
@RequiredArgsConstructor
public class AgentDefinitionArchiveCmdExecutor {

    private final AgentDefinitionDomainService agentDefinitionDomainService;

    public boolean archive(Long definitionId) {
        AgentDefinition definition = agentDefinitionDomainService.queryById(definitionId);
        if (definition == null) {
            throw new GenericBusinessException("AgentDefinition不存在: " + definitionId);
        }
        definition.setPublishStatus("ARCHIVED");
        definition.setStatus("INACTIVE");
        agentDefinitionDomainService.update(definition);
        return true;
    }

}
