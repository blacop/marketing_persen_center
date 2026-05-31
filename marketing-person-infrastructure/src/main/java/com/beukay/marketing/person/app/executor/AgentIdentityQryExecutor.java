package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.convertor.AgentIdentityDTOConvertor;
import com.beukay.marketing.person.client.dto.AgentIdentityDTO;
import com.beukay.marketing.person.client.qry.AgentIdentityPageQry;
import com.beukay.marketing.person.domain.agentIdentity.gateway.AgentIdentityGateway;
import com.beukay.marketing.person.domain.agentIdentity.model.AgentIdentity;
import com.beukay.marketing.person.domain.agentIdentity.model.AgentIdentityListCriteriaQuery;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 智能体身份查询执行器
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class AgentIdentityQryExecutor {

    private final AgentIdentityGateway agentIdentityGateway;

    /**
     * 分页查询智能体身份列表
     */
    public PageInfo<AgentIdentityDTO> listAgentIdentityPage(AgentIdentityPageQry qry) {
        PageInfo<AgentIdentity> pageInfo = agentIdentityGateway.listPage(
                AgentIdentityListCriteriaQuery.builder()
                        .name(qry.getName())
                        .status(qry.getStatus())
                        .agentType(qry.getAgentType())
                        .ownerId(qry.getOwnerId())
                        .build(),
                qry.getPageQuery());

        List<AgentIdentityDTO> list = pageInfo.getRecords().stream()
                .map(AgentIdentityDTOConvertor.INSTANCE::convert)
                .collect(Collectors.toList());

        PageInfo<AgentIdentityDTO> result = new PageInfo<>();
        result.setPageSize(pageInfo.getPageSize());
        result.setPageIndex(pageInfo.getPageIndex());
        result.setTotal(pageInfo.getTotal());
        result.setRecords(list);
        return result;
    }

}
