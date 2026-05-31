package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.convertor.AgentDefinitionDTOConvertor;
import com.beukay.marketing.person.client.dto.AgentDefinitionDTO;
import com.beukay.marketing.person.client.qry.AgentDefinitionPageQry;
import com.beukay.marketing.person.domain.agentDefinition.gateway.AgentDefinitionGateway;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinitionListCriteriaQuery;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Log4j2
@Component
@RequiredArgsConstructor
public class AgentDefinitionQryExecutor {

    private final AgentDefinitionGateway agentDefinitionGateway;

    public PageInfo<AgentDefinitionDTO> listAgentDefinitionPage(AgentDefinitionPageQry qry) {
        PageInfo<AgentDefinition> pageInfo = agentDefinitionGateway.listPage(
                AgentDefinitionListCriteriaQuery.builder()
                        .name(qry.getName())
                        .status(qry.getStatus())
                        .publishStatus(qry.getPublishStatus())
                        .build(),
                qry.getPageQuery());

        List<AgentDefinitionDTO> list = pageInfo.getRecords().stream()
                .map(AgentDefinitionDTOConvertor.INSTANCE::convert)
                .collect(Collectors.toList());

        PageInfo<AgentDefinitionDTO> result = new PageInfo<>();
        result.setPageSize(pageInfo.getPageSize());
        result.setPageIndex(pageInfo.getPageIndex());
        result.setTotal(pageInfo.getTotal());
        result.setRecords(list);
        return result;
    }

}
