package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.ai.common.mybatis.util.PageUtil;
import com.beukay.marketing.person.dbsdk.dao.KolPersonDOMapper;
import com.beukay.marketing.person.dbsdk.model.KolPersonDO;
import com.beukay.marketing.person.domain.kolPerson.gateway.KolPersonGateway;
import com.beukay.marketing.person.domain.kolPerson.model.KolPerson;
import com.beukay.marketing.person.domain.kolPerson.model.KolPersonListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.convertor.KolPersonConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * KolPerson Gateway实现
 */
@Component
@RequiredArgsConstructor
public class KolPersonGatewayImpl implements KolPersonGateway {

    private final KolPersonDOMapper kolPersonDOMapper;

    @Override
    public Long create(KolPerson kolPerson) {
        KolPersonDO doObj = KolPersonConvertor.INSTANCE.to(kolPerson);
        kolPersonDOMapper.insert(doObj);
        return doObj.getId();
    }

    @Override
    public void update(KolPerson kolPerson) {
        KolPersonDO doObj = KolPersonConvertor.INSTANCE.to(kolPerson);
        kolPersonDOMapper.updateById(doObj);
    }

    @Override
    public KolPerson queryById(Long id) {
        KolPersonDO doObj = kolPersonDOMapper.selectById(id);
        if (doObj == null) {
            return null;
        }
        return KolPersonConvertor.INSTANCE.from(doObj);
    }

    @Override
    public KolPerson queryByName(String name) {
        KolPersonDO doObj = kolPersonDOMapper.selectOne(
                new LambdaQueryWrapper<KolPersonDO>()
                        .eq(KolPersonDO::getName, name)
                        .eq(KolPersonDO::getIsDeleted, 0));
        if (doObj == null) {
            return null;
        }
        return KolPersonConvertor.INSTANCE.from(doObj);
    }

    @Override
    public PageInfo<KolPerson> listPage(KolPersonListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
        Page<KolPersonDO> page = kolPersonDOMapper.listPage(
                criteriaQuery.getName(),
                criteriaQuery.getStatus(),
                PageUtil.toIPage(pageQuery));

        List<KolPerson> list = page.getRecords().stream()
                .map(KolPersonConvertor.INSTANCE::from)
                .collect(Collectors.toList());

        return PageUtil.of(list, page.getTotal(), page.getSize(), page.getCurrent());
    }

}
