package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.app.convertor.ContentPatternKnowledgeDTOConvertor;
import com.beukay.marketing.person.client.dto.ContentPatternKnowledgeDTO;
import com.beukay.marketing.person.client.qry.ContentPatternKnowledgePageQry;
import com.beukay.marketing.person.domain.contentPatternKnowledge.gateway.ContentPatternKnowledgeGateway;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledge;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledgeListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.service.SkuIdResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ContentPatternKnowledgeQryExecutor {

    private final ContentPatternKnowledgeGateway contentPatternKnowledgeGateway;
    private final SkuIdResolver skuIdResolver;

    public PageInfo<ContentPatternKnowledgeDTO> listPage(ContentPatternKnowledgePageQry qry) {
        PageQuery pageQuery = qry.getPageQuery() == null ? new PageQuery() : qry.getPageQuery();
        String resolvedSkuId = skuIdResolver.resolve(qry.getSkuId());
        PageInfo<ContentPatternKnowledge> page = contentPatternKnowledgeGateway.listPage(
                ContentPatternKnowledgeListCriteriaQuery.builder()
                        .skuId(resolvedSkuId)
                        .marketingNode(qry.getMarketingNode())
                        .hookType(qry.getHookType())
                        .verificationStatus(qry.getVerificationStatus())
                        .build(),
                pageQuery);

        List<ContentPatternKnowledgeDTO> dtoList = page.getRecords().stream()
                .map(ContentPatternKnowledgeDTOConvertor.INSTANCE::convert)
                .toList();
        PageInfo<ContentPatternKnowledgeDTO> result = new PageInfo<>();
        result.setPageIndex(page.getPageIndex());
        result.setPageSize(page.getPageSize());
        result.setTotal(page.getTotal());
        result.setRecords(dtoList);
        return result;
    }
}
