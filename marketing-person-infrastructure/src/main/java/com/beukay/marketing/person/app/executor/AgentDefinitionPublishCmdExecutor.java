package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.app.service.AgentPublishAppService;
import com.beukay.marketing.person.client.dto.AgentDefinitionPublishDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Log4j2
@Component
@RequiredArgsConstructor
public class AgentDefinitionPublishCmdExecutor {

    private final AgentPublishAppService agentPublishAppService;

    public AgentDefinitionPublishDTO publish(Long definitionId, String publishVersion) {
        return agentPublishAppService.publish(definitionId, publishVersion);
    }

    public AgentDefinitionPublishDTO retryPublish(Long definitionId) {
        return agentPublishAppService.retryPublish(definitionId);
    }

}
