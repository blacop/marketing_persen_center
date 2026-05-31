package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.convertor.SkillRegistryDTOConvertor;
import com.beukay.marketing.person.client.dto.SkillRegistryDTO;
import com.beukay.marketing.person.client.qry.SkillRegistryPageQry;
import com.beukay.marketing.person.domain.skillRegistry.gateway.SkillRegistryGateway;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistry;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistryListCriteriaQuery;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 技能注册查询执行器
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class SkillRegistryQryExecutor {

    private final SkillRegistryGateway skillRegistryGateway;

    /**
     * 分页查询技能注册列表
     */
    public PageInfo<SkillRegistryDTO> listSkillRegistryPage(SkillRegistryPageQry qry) {
        PageInfo<SkillRegistry> pageInfo = skillRegistryGateway.listPage(
                SkillRegistryListCriteriaQuery.builder()
                        .name(qry.getName())
                        .status(qry.getStatus())
                        .category(qry.getCategory())
                        .source(qry.getSource())
                        .build(),
                qry.getPageQuery());

        List<SkillRegistryDTO> list = pageInfo.getRecords().stream()
                .map(SkillRegistryDTOConvertor.INSTANCE::convert)
                .collect(Collectors.toList());

        PageInfo<SkillRegistryDTO> result = new PageInfo<>();
        result.setPageSize(pageInfo.getPageSize());
        result.setPageIndex(pageInfo.getPageIndex());
        result.setTotal(pageInfo.getTotal());
        result.setRecords(list);
        return result;
    }

}
