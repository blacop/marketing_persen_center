package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.ai.common.mybatis.util.PageUtil;
import com.beukay.marketing.person.dbsdk.dao.AgentPublishRecordDOMapper;
import com.beukay.marketing.person.dbsdk.model.AgentPublishRecordDO;
import com.beukay.marketing.person.domain.agentPublishRecord.gateway.AgentPublishRecordGateway;
import com.beukay.marketing.person.domain.agentPublishRecord.model.AgentPublishRecord;
import com.beukay.marketing.person.domain.agentPublishRecord.model.AgentPublishRecordListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.convertor.AgentPublishRecordConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AgentPublishRecordGatewayImpl implements AgentPublishRecordGateway {

    private final AgentPublishRecordDOMapper agentPublishRecordDOMapper;

    @Override
    public Long create(AgentPublishRecord agentPublishRecord) {
        AgentPublishRecordDO doObj = AgentPublishRecordConvertor.INSTANCE.to(agentPublishRecord);
        agentPublishRecordDOMapper.insert(doObj);
        return doObj.getId();
    }

    @Override
    public void update(AgentPublishRecord agentPublishRecord) {
        AgentPublishRecordDO doObj = AgentPublishRecordConvertor.INSTANCE.to(agentPublishRecord);
        agentPublishRecordDOMapper.updateById(doObj);
    }

    @Override
    public AgentPublishRecord queryById(Long id) {
        AgentPublishRecordDO doObj = agentPublishRecordDOMapper.selectById(id);
        return doObj == null ? null : AgentPublishRecordConvertor.INSTANCE.from(doObj);
    }

    @Override
    public PageInfo<AgentPublishRecord> listPage(AgentPublishRecordListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
        Page<AgentPublishRecordDO> page = agentPublishRecordDOMapper.listPage(
                criteriaQuery.getDefinitionId(),
                criteriaQuery.getPublishStatus(),
                PageUtil.toIPage(pageQuery));

        List<AgentPublishRecord> list = page.getRecords().stream()
                .map(AgentPublishRecordConvertor.INSTANCE::from)
                .collect(Collectors.toList());

        return PageUtil.of(list, page.getTotal(), page.getSize(), page.getCurrent());
    }

}
