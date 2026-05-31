package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.ai.common.mybatis.util.PageUtil;
import com.beukay.marketing.person.dbsdk.dao.AgentDefinitionDOMapper;
import com.beukay.marketing.person.dbsdk.model.AgentDefinitionDO;
import com.beukay.marketing.person.domain.agentDefinition.gateway.AgentDefinitionGateway;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;
import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinitionListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.convertor.AgentDefinitionConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AgentDefinitionGatewayImpl implements AgentDefinitionGateway {

    private final AgentDefinitionDOMapper agentDefinitionDOMapper;

    @Override
    public Long create(AgentDefinition agentDefinition) {
        AgentDefinitionDO doObj = AgentDefinitionConvertor.INSTANCE.to(agentDefinition);
        agentDefinitionDOMapper.insert(doObj);
        return doObj.getId();
    }

    @Override
    public void update(AgentDefinition agentDefinition) {
        AgentDefinitionDO doObj = AgentDefinitionConvertor.INSTANCE.to(agentDefinition);
        agentDefinitionDOMapper.updateById(doObj);
    }

    @Override
    public AgentDefinition queryById(Long id) {
        AgentDefinitionDO doObj = agentDefinitionDOMapper.selectById(id);
        return doObj == null ? null : AgentDefinitionConvertor.INSTANCE.from(doObj);
    }

    @Override
    public AgentDefinition queryByName(String name) {
        AgentDefinitionDO doObj = agentDefinitionDOMapper.selectOne(
                new LambdaQueryWrapper<AgentDefinitionDO>()
                        .eq(AgentDefinitionDO::getName, name)
                        .eq(AgentDefinitionDO::getIsDeleted, 0));
        return doObj == null ? null : AgentDefinitionConvertor.INSTANCE.from(doObj);
    }

    @Override
    public AgentDefinition queryByAgentDefId(String agentDefId) {
        AgentDefinitionDO doObj = agentDefinitionDOMapper.selectOne(
                new LambdaQueryWrapper<AgentDefinitionDO>()
                        .eq(AgentDefinitionDO::getAgentDefId, agentDefId)
                        .eq(AgentDefinitionDO::getIsDeleted, 0));
        return doObj == null ? null : AgentDefinitionConvertor.INSTANCE.from(doObj);
    }

    @Override
    public PageInfo<AgentDefinition> listPage(AgentDefinitionListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
        Page<AgentDefinitionDO> page = agentDefinitionDOMapper.listPage(
                criteriaQuery.getName(),
                criteriaQuery.getStatus(),
                criteriaQuery.getPublishStatus(),
                PageUtil.toIPage(pageQuery));

        List<AgentDefinition> list = page.getRecords().stream()
                .map(AgentDefinitionConvertor.INSTANCE::from)
                .collect(Collectors.toList());

        return PageUtil.of(list, page.getTotal(), page.getSize(), page.getCurrent());
    }

}
