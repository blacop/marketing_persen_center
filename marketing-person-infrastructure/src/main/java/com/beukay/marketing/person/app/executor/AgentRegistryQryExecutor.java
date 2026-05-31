package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.convertor.AgentRegistryDTOConvertor;
import com.beukay.marketing.person.client.dto.AgentRegistryDTO;
import com.beukay.marketing.person.client.qry.AgentRegistryPageQry;
import com.beukay.marketing.person.domain.agentRegistry.gateway.AgentRegistryGateway;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistry;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistryListCriteriaQuery;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AgentRegistry查询执行器
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class AgentRegistryQryExecutor {

    private final AgentRegistryGateway agentRegistryGateway;

    public PageInfo<AgentRegistryDTO> listAgentRegistryPage(AgentRegistryPageQry qry) {
        PageInfo<AgentRegistry> pageInfo = agentRegistryGateway.listPage(
                AgentRegistryListCriteriaQuery.builder()
                        .name(qry.getName())
                        .status(qry.getStatus())
                        .category(qry.getCategory())
                        .agentType(qry.getAgentType())
                        .build(),
                qry.getPageQuery());

        List<AgentRegistryDTO> list = pageInfo.getRecords().stream()
                .map(AgentRegistryDTOConvertor.INSTANCE::convert)
                .collect(Collectors.toList());

        PageInfo<AgentRegistryDTO> result = new PageInfo<>();
        result.setPageSize(pageInfo.getPageSize());
        result.setPageIndex(pageInfo.getPageIndex());
        result.setTotal(pageInfo.getTotal());
        result.setRecords(list);
        return result;
    }

}
