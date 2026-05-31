package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.ai.common.mybatis.util.PageUtil;
import com.beukay.marketing.person.dbsdk.dao.SkillRegistryDOMapper;
import com.beukay.marketing.person.dbsdk.model.SkillRegistryDO;
import com.beukay.marketing.person.domain.skillRegistry.gateway.SkillRegistryGateway;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistry;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistryListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.convertor.SkillRegistryConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 技能注册 Gateway 实现
 */
@Component
@RequiredArgsConstructor
public class SkillRegistryGatewayImpl implements SkillRegistryGateway {

    private final SkillRegistryDOMapper skillRegistryDOMapper;

    @Override
    public Long create(SkillRegistry skillRegistry) {
        SkillRegistryDO doObj = SkillRegistryConvertor.INSTANCE.to(skillRegistry);
        skillRegistryDOMapper.insert(doObj);
        return doObj.getId();
    }

    @Override
    public void update(SkillRegistry skillRegistry) {
        SkillRegistryDO doObj = SkillRegistryConvertor.INSTANCE.to(skillRegistry);
        skillRegistryDOMapper.updateById(doObj);
    }

    @Override
    public SkillRegistry queryById(Long id) {
        SkillRegistryDO doObj = skillRegistryDOMapper.selectById(id);
        if (doObj == null) {
            return null;
        }
        return SkillRegistryConvertor.INSTANCE.from(doObj);
    }

    @Override
    public SkillRegistry queryBySkillId(String skillId) {
        SkillRegistryDO doObj = skillRegistryDOMapper.selectOne(
                new LambdaQueryWrapper<SkillRegistryDO>()
                        .eq(SkillRegistryDO::getSkillId, skillId)
                        .eq(SkillRegistryDO::getIsDeleted, 0));
        if (doObj == null) {
            return null;
        }
        return SkillRegistryConvertor.INSTANCE.from(doObj);
    }

    @Override
    public PageInfo<SkillRegistry> listPage(SkillRegistryListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
        Page<SkillRegistryDO> page = skillRegistryDOMapper.listPage(
                criteriaQuery.getName(),
                criteriaQuery.getStatus(),
                criteriaQuery.getCategory(),
                criteriaQuery.getSource(),
                PageUtil.toIPage(pageQuery));

        List<SkillRegistry> list = page.getRecords().stream()
                .map(SkillRegistryConvertor.INSTANCE::from)
                .collect(Collectors.toList());

        return PageUtil.of(list, page.getTotal(), page.getSize(), page.getCurrent());
    }

}
