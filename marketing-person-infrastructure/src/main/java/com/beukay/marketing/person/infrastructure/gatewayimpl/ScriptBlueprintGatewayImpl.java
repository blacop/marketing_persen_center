package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.dbsdk.dao.ScriptBlueprintDOMapper;
import com.beukay.marketing.person.dbsdk.model.ScriptBlueprintDO;
import com.beukay.marketing.person.domain.scriptBlueprint.gateway.ScriptBlueprintGateway;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprint;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintCriteria;
import com.beukay.marketing.person.infrastructure.convertor.ScriptBlueprintConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ScriptBlueprintGatewayImpl implements ScriptBlueprintGateway {

    private final ScriptBlueprintDOMapper mapper;

    @Override
    public Long create(ScriptBlueprint blueprint) {
        ScriptBlueprintDO doObj = ScriptBlueprintConvertor.INSTANCE.to(blueprint);
        mapper.insert(doObj);
        return doObj.getId();
    }

    @Override
    public void update(ScriptBlueprint blueprint) {
        mapper.updateById(ScriptBlueprintConvertor.INSTANCE.to(blueprint));
    }

    @Override
    public ScriptBlueprint queryById(Long id) {
        ScriptBlueprintDO doObj = mapper.selectOne(new LambdaQueryWrapper<ScriptBlueprintDO>()
                .eq(ScriptBlueprintDO::getId, id)
                .eq(ScriptBlueprintDO::getIsDeleted, 0)
                .last("limit 1"));
        return doObj == null ? null : ScriptBlueprintConvertor.INSTANCE.from(doObj);
    }

    @Override
    public ScriptBlueprint queryByBlueprintCode(String blueprintCode) {
        ScriptBlueprintDO doObj = mapper.selectOne(new LambdaQueryWrapper<ScriptBlueprintDO>()
                .eq(ScriptBlueprintDO::getBlueprintCode, blueprintCode)
                .eq(ScriptBlueprintDO::getIsDeleted, 0)
                .last("limit 1"));
        return doObj == null ? null : ScriptBlueprintConvertor.INSTANCE.from(doObj);
    }

    @Override
    public PageInfo<ScriptBlueprint> listByPage(ScriptBlueprintCriteria criteria) {
        long pageIndex = criteria.getPageIndex() > 0 ? criteria.getPageIndex() : 1L;
        long pageSize = criteria.getPageSize() > 0 ? criteria.getPageSize() : 20L;
        LambdaQueryWrapper<ScriptBlueprintDO> wrapper = new LambdaQueryWrapper<ScriptBlueprintDO>()
                .eq(ScriptBlueprintDO::getIsDeleted, 0)
                .eq(StringUtils.hasText(criteria.getSkuId()), ScriptBlueprintDO::getSkuId, criteria.getSkuId())
                .eq(StringUtils.hasText(criteria.getMarketingGoal()), ScriptBlueprintDO::getMarketingGoal, criteria.getMarketingGoal())
                .eq(StringUtils.hasText(criteria.getPlatform()), ScriptBlueprintDO::getPlatform, criteria.getPlatform())
                .eq(StringUtils.hasText(criteria.getStatus()), ScriptBlueprintDO::getStatus, criteria.getStatus())
                .orderByDesc(ScriptBlueprintDO::getCreateAt);
        Page<ScriptBlueprintDO> page = mapper.selectPage(new Page<>(pageIndex, pageSize), wrapper);
        List<ScriptBlueprint> records = page.getRecords().stream()
                .map(ScriptBlueprintConvertor.INSTANCE::from)
                .toList();
        PageInfo<ScriptBlueprint> result = new PageInfo<>();
        result.setRecords(records);
        result.setTotal(page.getTotal());
        result.setPageIndex(pageIndex);
        result.setPageSize(pageSize);
        return result;
    }
}
