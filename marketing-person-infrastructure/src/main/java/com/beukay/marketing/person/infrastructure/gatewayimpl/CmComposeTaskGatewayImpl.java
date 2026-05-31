package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.beukay.marketing.person.dbsdk.dao.CmComposeTaskDOMapper;
import com.beukay.marketing.person.dbsdk.model.CmComposeTaskDO;
import com.beukay.marketing.person.domain.cutmatrix.compose.gateway.CmComposeTaskGateway;
import com.beukay.marketing.person.domain.cutmatrix.compose.model.CmComposeTask;
import com.beukay.marketing.person.infrastructure.convertor.CmComposeTaskConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CmComposeTaskGatewayImpl implements CmComposeTaskGateway {

    private final CmComposeTaskDOMapper mapper;

    @Override
    public Long save(CmComposeTask task) {
        if (task.getId() == null) {
            CmComposeTaskDO doObj = CmComposeTaskConvertor.INSTANCE.to(task);
            mapper.insert(doObj);
            return doObj.getId();
        }
        mapper.updateById(CmComposeTaskConvertor.INSTANCE.to(task));
        return task.getId();
    }

    @Override
    public CmComposeTask getByCode(String taskCode) {
        CmComposeTaskDO doObj = mapper.selectOne(new LambdaQueryWrapper<CmComposeTaskDO>()
                .eq(CmComposeTaskDO::getTaskCode, taskCode)
                .eq(CmComposeTaskDO::getIsDeleted, 0)
                .last("limit 1"));
        return doObj == null ? null : CmComposeTaskConvertor.INSTANCE.from(doObj);
    }

    @Override
    public List<CmComposeTask> listByCollection(String collectionCode) {
        return mapper.selectList(new LambdaQueryWrapper<CmComposeTaskDO>()
                .eq(CmComposeTaskDO::getCollectionCode, collectionCode)
                .eq(CmComposeTaskDO::getIsDeleted, 0)
                .orderByDesc(CmComposeTaskDO::getCreateAt))
                .stream().map(CmComposeTaskConvertor.INSTANCE::from).toList();
    }
}
