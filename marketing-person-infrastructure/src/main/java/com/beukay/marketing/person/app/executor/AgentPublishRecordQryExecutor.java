package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.convertor.AgentPublishRecordDTOConvertor;
import com.beukay.marketing.person.client.dto.AgentPublishRecordDTO;
import com.beukay.marketing.person.client.qry.AgentPublishRecordPageQry;
import com.beukay.marketing.person.domain.agentPublishRecord.gateway.AgentPublishRecordGateway;
import com.beukay.marketing.person.domain.agentPublishRecord.model.AgentPublishRecord;
import com.beukay.marketing.person.domain.agentPublishRecord.model.AgentPublishRecordListCriteriaQuery;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

import com.beukay.ai.common.exception.GenericBusinessException;
@Log4j2
@Component
@RequiredArgsConstructor
public class AgentPublishRecordQryExecutor {

    private final AgentPublishRecordGateway agentPublishRecordGateway;

    public AgentPublishRecordDTO getAgentPublishRecord(Long id) {
        AgentPublishRecord record = agentPublishRecordGateway.queryById(id);
        if (record == null) {
            throw new GenericBusinessException("AgentPublishRecord不存在: " + id);
        }
        return AgentPublishRecordDTOConvertor.INSTANCE.convert(record);
    }

    public PageInfo<AgentPublishRecordDTO> listAgentPublishRecordPage(AgentPublishRecordPageQry qry) {
        PageInfo<AgentPublishRecord> pageInfo = agentPublishRecordGateway.listPage(
                AgentPublishRecordListCriteriaQuery.builder()
                        .definitionId(qry.getDefinitionId())
                        .publishStatus(qry.getPublishStatus())
                        .build(),
                qry.getPageQuery());

        List<AgentPublishRecordDTO> list = pageInfo.getRecords().stream()
                .map(AgentPublishRecordDTOConvertor.INSTANCE::convert)
                .collect(Collectors.toList());

        PageInfo<AgentPublishRecordDTO> result = new PageInfo<>();
        result.setPageSize(pageInfo.getPageSize());
        result.setPageIndex(pageInfo.getPageIndex());
        result.setTotal(pageInfo.getTotal());
        result.setRecords(list);
        return result;
    }

}
