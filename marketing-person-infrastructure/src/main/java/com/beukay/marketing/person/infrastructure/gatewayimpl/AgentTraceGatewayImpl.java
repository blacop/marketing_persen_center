package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.ai.common.mybatis.util.PageUtil;
import com.beukay.marketing.person.dbsdk.dao.AgentTraceDOMapper;
import com.beukay.marketing.person.dbsdk.model.AgentTraceDO;
import com.beukay.marketing.person.domain.agentTrace.gateway.AgentTraceGateway;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTrace;
import com.beukay.marketing.person.domain.agentTrace.model.AgentTraceListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.convertor.AgentTraceConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AgentTraceGatewayImpl implements AgentTraceGateway {

    private final AgentTraceDOMapper agentTraceDOMapper;

    @Override
    public Long create(AgentTrace agentTrace) {
        AgentTraceDO doObj = AgentTraceConvertor.INSTANCE.to(agentTrace);
        agentTraceDOMapper.insert(doObj);
        return doObj.getId();
    }

    @Override
    public void update(AgentTrace agentTrace) {
        AgentTraceDO doObj = AgentTraceConvertor.INSTANCE.to(agentTrace);
        agentTraceDOMapper.updateById(doObj);
    }

    @Override
    public AgentTrace queryById(Long id) {
        AgentTraceDO doObj = agentTraceDOMapper.selectById(id);
        return doObj == null ? null : AgentTraceConvertor.INSTANCE.from(doObj);
    }

    @Override
    public AgentTrace queryByName(String name) {
        AgentTraceDO doObj = agentTraceDOMapper.selectOne(
                new LambdaQueryWrapper<AgentTraceDO>()
                        .eq(AgentTraceDO::getName, name)
                        .eq(AgentTraceDO::getIsDeleted, 0));
        return doObj == null ? null : AgentTraceConvertor.INSTANCE.from(doObj);
    }

    @Override
    public PageInfo<AgentTrace> listPage(AgentTraceListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
        Page<AgentTraceDO> page = agentTraceDOMapper.listPage(
                criteriaQuery.getName(),
                criteriaQuery.getStatus(),
                criteriaQuery.getAgentId(),
                criteriaQuery.getTraceType(),
                criteriaQuery.getTraceStatus(),
                criteriaQuery.getDefinitionId(),
                PageUtil.toIPage(pageQuery));

        List<AgentTrace> list = page.getRecords().stream()
                .map(AgentTraceConvertor.INSTANCE::from)
                .collect(Collectors.toList());

        return PageUtil.of(list, page.getTotal(), page.getSize(), page.getCurrent());
    }

}
