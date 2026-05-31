package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.beukay.marketing.person.dbsdk.dao.CmCollectionDOMapper;
import com.beukay.marketing.person.dbsdk.model.CmCollectionDO;
import com.beukay.marketing.person.domain.cutmatrix.collection.gateway.CmCollectionGateway;
import com.beukay.marketing.person.domain.cutmatrix.collection.model.CmCollection;
import com.beukay.marketing.person.infrastructure.convertor.CmCollectionConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CmCollectionGatewayImpl implements CmCollectionGateway {

    private final CmCollectionDOMapper mapper;

    @Override
    public Long save(CmCollection collection) {
        if (collection.getId() == null) {
            CmCollectionDO doObj = CmCollectionConvertor.INSTANCE.to(collection);
            mapper.insert(doObj);
            return doObj.getId();
        }
        mapper.updateById(CmCollectionConvertor.INSTANCE.to(collection));
        return collection.getId();
    }

    @Override
    public CmCollection getByCode(String collectionCode) {
        CmCollectionDO doObj = mapper.selectOne(new LambdaQueryWrapper<CmCollectionDO>()
                .eq(CmCollectionDO::getCollectionCode, collectionCode)
                .eq(CmCollectionDO::getIsDeleted, 0)
                .last("limit 1"));
        return doObj == null ? null : CmCollectionConvertor.INSTANCE.from(doObj);
    }

    @Override
    public List<CmCollection> listAll() {
        return mapper.selectList(new LambdaQueryWrapper<CmCollectionDO>()
                .eq(CmCollectionDO::getIsDeleted, 0)
                .orderByDesc(CmCollectionDO::getCreateAt))
                .stream().map(CmCollectionConvertor.INSTANCE::from).toList();
    }

    @Override
    public void deleteByCode(String collectionCode) {
        CmCollectionDO existing = mapper.selectOne(new LambdaQueryWrapper<CmCollectionDO>()
                .eq(CmCollectionDO::getCollectionCode, collectionCode)
                .eq(CmCollectionDO::getIsDeleted, 0)
                .last("limit 1"));
        if (existing != null) {
            existing.setIsDeleted(1);
            mapper.updateById(existing);
        }
    }
}
