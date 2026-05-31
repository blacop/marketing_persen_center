package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.exception.GenericBusinessException;
import com.beukay.marketing.person.app.convertor.AgentDefinitionDTOConvertor;
import com.beukay.marketing.person.client.dto.AgentDefinitionDTO;
import com.beukay.marketing.person.domain.agentDefinition.gateway.AgentDefinitionGateway;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Log4j2
@Component
@RequiredArgsConstructor
public class AgentDefinitionDetailQryExecutor {

    private final AgentDefinitionGateway agentDefinitionGateway;

    public AgentDefinitionDTO getAgentDefinition(Long id) {
        AgentDefinition definition = agentDefinitionGateway.queryById(id);
        if (definition == null) {
            throw new GenericBusinessException("AgentDefinition不存在: " + id);
        }

        return AgentDefinitionDTOConvertor.INSTANCE.convert(definition);
    }

}
