package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.ai.common.mybatis.util.PageUtil;
import com.beukay.marketing.person.dbsdk.dao.AgentIdentityDOMapper;
import com.beukay.marketing.person.dbsdk.model.AgentIdentityDO;
import com.beukay.marketing.person.domain.agentIdentity.gateway.AgentIdentityGateway;
import com.beukay.marketing.person.domain.agentIdentity.model.AgentIdentity;
import com.beukay.marketing.person.domain.agentIdentity.model.AgentIdentityListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.convertor.AgentIdentityConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 智能体身份 Gateway 实现
 */
@Component
@RequiredArgsConstructor
public class AgentIdentityGatewayImpl implements AgentIdentityGateway {

    private final AgentIdentityDOMapper agentIdentityDOMapper;

    @Override
    public Long create(AgentIdentity agentIdentity) {
        AgentIdentityDO doObj = AgentIdentityConvertor.INSTANCE.to(agentIdentity);
        agentIdentityDOMapper.insert(doObj);
        return doObj.getId();
    }

    @Override
    public void update(AgentIdentity agentIdentity) {
        AgentIdentityDO doObj = AgentIdentityConvertor.INSTANCE.to(agentIdentity);
        agentIdentityDOMapper.updateById(doObj);
    }

    @Override
    public AgentIdentity queryById(Long id) {
        AgentIdentityDO doObj = agentIdentityDOMapper.selectById(id);
        if (doObj == null) {
            return null;
        }
        return AgentIdentityConvertor.INSTANCE.from(doObj);
    }

    @Override
    public AgentIdentity queryByAgentUniqueId(String agentUniqueId) {
        AgentIdentityDO doObj = agentIdentityDOMapper.selectOne(
                new LambdaQueryWrapper<AgentIdentityDO>()
                        .eq(AgentIdentityDO::getAgentUniqueId, agentUniqueId)
                        .eq(AgentIdentityDO::getIsDeleted, 0));
        if (doObj == null) {
            return null;
        }
        return AgentIdentityConvertor.INSTANCE.from(doObj);
    }

    @Override
    public PageInfo<AgentIdentity> listPage(AgentIdentityListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
        Page<AgentIdentityDO> page = agentIdentityDOMapper.listPage(
                criteriaQuery.getName(),
                criteriaQuery.getStatus(),
                criteriaQuery.getAgentType(),
                criteriaQuery.getOwnerId(),
                PageUtil.toIPage(pageQuery));

        List<AgentIdentity> list = page.getRecords().stream()
                .map(AgentIdentityConvertor.INSTANCE::from)
                .collect(Collectors.toList());

        return PageUtil.of(list, page.getTotal(), page.getSize(), page.getCurrent());
    }

}
