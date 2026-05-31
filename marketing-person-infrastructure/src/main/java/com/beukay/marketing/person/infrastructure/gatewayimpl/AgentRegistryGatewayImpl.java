package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.ai.common.mybatis.util.PageUtil;
import com.beukay.marketing.person.dbsdk.dao.AgentRegistryDOMapper;
import com.beukay.marketing.person.dbsdk.model.AgentRegistryDO;
import com.beukay.marketing.person.domain.agentRegistry.gateway.AgentRegistryGateway;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistry;
import com.beukay.marketing.person.domain.agentRegistry.model.AgentRegistryListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.convertor.AgentRegistryConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AgentRegistryGatewayImpl implements AgentRegistryGateway {

    private final AgentRegistryDOMapper agentRegistryDOMapper;

    @Override
    public Long create(AgentRegistry agentRegistry) {
        AgentRegistryDO doObj = AgentRegistryConvertor.INSTANCE.to(agentRegistry);
        agentRegistryDOMapper.insert(doObj);
        return doObj.getId();
    }

    @Override
    public void update(AgentRegistry agentRegistry) {
        AgentRegistryDO doObj = AgentRegistryConvertor.INSTANCE.to(agentRegistry);
        agentRegistryDOMapper.updateById(doObj);
    }

    @Override
    public AgentRegistry queryById(Long id) {
        AgentRegistryDO doObj = agentRegistryDOMapper.selectById(id);
        return doObj == null ? null : AgentRegistryConvertor.INSTANCE.from(doObj);
    }

    @Override
    public AgentRegistry queryByName(String name) {
        AgentRegistryDO doObj = agentRegistryDOMapper.selectOne(
                new LambdaQueryWrapper<AgentRegistryDO>()
                        .eq(AgentRegistryDO::getName, name)
                        .eq(AgentRegistryDO::getIsDeleted, 0));
        return doObj == null ? null : AgentRegistryConvertor.INSTANCE.from(doObj);
    }

    @Override
    public AgentRegistry queryByAgentUniqueId(String agentUniqueId) {
        AgentRegistryDO doObj = agentRegistryDOMapper.selectOne(
                new LambdaQueryWrapper<AgentRegistryDO>()
                        .eq(AgentRegistryDO::getAgentUniqueId, agentUniqueId)
                        .eq(AgentRegistryDO::getIsDeleted, 0));
        return doObj == null ? null : AgentRegistryConvertor.INSTANCE.from(doObj);
    }

    @Override
    public PageInfo<AgentRegistry> listPage(AgentRegistryListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
        Page<AgentRegistryDO> page = agentRegistryDOMapper.listPage(
                criteriaQuery.getName(),
                criteriaQuery.getStatus(),
                criteriaQuery.getCategory(),
                criteriaQuery.getAgentType(),
                PageUtil.toIPage(pageQuery));

        List<AgentRegistry> list = page.getRecords().stream()
                .map(AgentRegistryConvertor.INSTANCE::from)
                .collect(Collectors.toList());

        return PageUtil.of(list, page.getTotal(), page.getSize(), page.getCurrent());
    }

}
