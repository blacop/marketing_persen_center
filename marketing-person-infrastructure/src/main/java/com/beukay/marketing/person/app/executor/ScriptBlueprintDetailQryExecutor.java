package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.convertor.ScriptBlueprintDTOConvertor;
import com.beukay.marketing.person.app.convertor.ScriptBlueprintSectionDTOConvertor;
import com.beukay.marketing.person.client.dto.ScriptBlueprintDTO;
import com.beukay.marketing.person.client.qry.ScriptBlueprintPageQry;
import com.beukay.marketing.person.domain.scriptBlueprint.gateway.ScriptBlueprintGateway;
import com.beukay.marketing.person.domain.scriptBlueprint.gateway.ScriptBlueprintSectionGateway;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprint;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintCriteria;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScriptBlueprintDetailQryExecutor {

    private final ScriptBlueprintGateway scriptBlueprintGateway;
    private final ScriptBlueprintSectionGateway scriptBlueprintSectionGateway;

    public ScriptBlueprintDTO getById(Long id) {
        ScriptBlueprint blueprint = scriptBlueprintGateway.queryById(id);
        return toDto(blueprint);
    }

    public ScriptBlueprintDTO getByBlueprintCode(String blueprintCode) {
        ScriptBlueprint blueprint = scriptBlueprintGateway.queryByBlueprintCode(blueprintCode);
        return toDto(blueprint);
    }

    public PageInfo<ScriptBlueprintDTO> listByPage(ScriptBlueprintPageQry qry) {
        ScriptBlueprintCriteria criteria = ScriptBlueprintCriteria.builder()
                .skuId(qry.getSkuId())
                .marketingGoal(qry.getMarketingGoal())
                .platform(qry.getPlatform())
                .status(qry.getStatus())
                .pageIndex(qry.getPageQuery() != null && qry.getPageQuery().getPageIndex() != null ? qry.getPageQuery().getPageIndex() : 1L)
                .pageSize(qry.getPageQuery() != null && qry.getPageQuery().getPageSize() != null ? qry.getPageQuery().getPageSize() : 20L)
                .build();
        PageInfo<ScriptBlueprint> page = scriptBlueprintGateway.listByPage(criteria);
        PageInfo<ScriptBlueprintDTO> result = new PageInfo<>();
        result.setRecords(page.getRecords().stream()
                .map(this::toDtoSummary)
                .toList());
        result.setTotal(page.getTotal());
        result.setPageIndex(page.getPageIndex());
        result.setPageSize(page.getPageSize());
        return result;
    }

    private ScriptBlueprintDTO toDto(ScriptBlueprint blueprint) {
        ScriptBlueprintDTO dto = ScriptBlueprintDTOConvertor.INSTANCE.convert(blueprint);
        dto.setSections(scriptBlueprintSectionGateway.listByBlueprintCode(blueprint.getBlueprintCode()).stream()
                .map(ScriptBlueprintSectionDTOConvertor.INSTANCE::convert)
                .toList());
        return dto;
    }

    /** 列表视图只返回摘要，不加载 sections，减少不必要 IO */
    private ScriptBlueprintDTO toDtoSummary(ScriptBlueprint blueprint) {
        return ScriptBlueprintDTOConvertor.INSTANCE.convert(blueprint);
    }
}
