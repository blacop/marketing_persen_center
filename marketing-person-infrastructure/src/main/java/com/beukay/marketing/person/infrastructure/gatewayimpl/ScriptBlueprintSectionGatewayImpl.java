package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.beukay.marketing.person.dbsdk.dao.ScriptBlueprintSectionDOMapper;
import com.beukay.marketing.person.dbsdk.model.ScriptBlueprintSectionDO;
import com.beukay.marketing.person.domain.scriptBlueprint.gateway.ScriptBlueprintSectionGateway;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintSection;
import com.beukay.marketing.person.infrastructure.convertor.ScriptBlueprintSectionConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ScriptBlueprintSectionGatewayImpl implements ScriptBlueprintSectionGateway {

    private final ScriptBlueprintSectionDOMapper mapper;

    @Override
    public void batchCreate(List<ScriptBlueprintSection> sections) {
        for (ScriptBlueprintSection section : sections) {
            mapper.insert(ScriptBlueprintSectionConvertor.INSTANCE.to(section));
        }
    }

    @Override
    public List<ScriptBlueprintSection> listByBlueprintCode(String blueprintCode) {
        return mapper.selectList(new LambdaQueryWrapper<ScriptBlueprintSectionDO>()
                        .eq(ScriptBlueprintSectionDO::getBlueprintCode, blueprintCode)
                        .eq(ScriptBlueprintSectionDO::getIsDeleted, 0)
                        .orderByAsc(ScriptBlueprintSectionDO::getSectionNo)
                        .orderByDesc(ScriptBlueprintSectionDO::getId))
                .stream()
                .map(ScriptBlueprintSectionConvertor.INSTANCE::from)
                .toList();
    }
}
