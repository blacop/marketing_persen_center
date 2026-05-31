package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.convertor.AgentTraceDTOConvertor;
import com.beukay.marketing.person.client.dto.AgentTraceDTO;
import com.beukay.marketing.person.client.qry.AgentTracePageQry;
import com.beukay.marketing.person.domain.agentTrace.gateway.AgentTraceGateway;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTrace;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTraceListCriteriaQuery;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Log4j2
@Component
@RequiredArgsConstructor
public class AgentTraceQryExecutor {

    private final AgentTraceGateway agentTraceGateway;

    public PageInfo<AgentTraceDTO> listAgentTracePage(AgentTracePageQry qry) {
        PageInfo<AgentTrace> pageInfo = agentTraceGateway.listPage(
                AgentTraceListCriteriaQuery.builder()
                        .name(qry.getName())
                        .status(qry.getStatus())
                        .agentId(qry.getAgentId())
                        .traceType(qry.getTraceType())
                        .traceStatus(qry.getTraceStatus())
                        .definitionId(qry.getDefinitionId())
                        .build(),
                qry.getPageQuery());

        List<AgentTraceDTO> list = pageInfo.getRecords().stream()
                .map(AgentTraceDTOConvertor.INSTANCE::convert)
                .collect(Collectors.toList());

        PageInfo<AgentTraceDTO> result = new PageInfo<>();
        result.setPageSize(pageInfo.getPageSize());
        result.setPageIndex(pageInfo.getPageIndex());
        result.setTotal(pageInfo.getTotal());
        result.setRecords(list);
        return result;
    }

}
