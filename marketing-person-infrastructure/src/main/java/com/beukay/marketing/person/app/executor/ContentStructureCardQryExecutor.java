package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.client.dto.ContentStructureCardDTO;
import com.beukay.marketing.person.client.qry.ContentStructureCardDetailQry;
import com.beukay.marketing.person.client.qry.ContentStructureCardPageQry;
import com.beukay.marketing.person.domain.contentStructureCard.ability.ContentStructureCardDomainService;
import com.beukay.marketing.person.domain.contentStructureCard.gateway.ContentStructureCardGateway;
import com.beukay.marketing.person.domain.contentStructureCard.model.ContentStructureCard;
import com.beukay.marketing.person.domain.contentStructureCard.model.ContentStructureCardListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.service.SkuIdResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

@Component
@RequiredArgsConstructor
@Log4j2
public class ContentStructureCardQryExecutor {

    private final ContentStructureCardDomainService contentStructureCardDomainService;
    private final ContentStructureCardGateway contentStructureCardGateway;
    private final SkuIdResolver skuIdResolver;

    public ContentStructureCardDTO get(ContentStructureCardDetailQry qry) {
        ContentStructureCard card = null;
        if (StringUtils.hasText(qry.getCardId())) {
            card = contentStructureCardDomainService.queryByCardId(qry.getCardId());
        } else if (qry.getId() != null) {
            card = contentStructureCardDomainService.queryById(qry.getId());
        }
        return toDTO(card);
    }

    public PageInfo<ContentStructureCardDTO> listPage(ContentStructureCardPageQry qry) {
        PageQuery pageQuery = qry.getPageQuery() != null ? qry.getPageQuery()
                : PageQuery.builder().pageIndex(1L).pageSize(20L).build();
        String resolvedSkuId = skuIdResolver.resolve(qry.getSkuId());
        ContentStructureCardListCriteriaQuery criteria = ContentStructureCardListCriteriaQuery.builder()
                .skuId(resolvedSkuId)
                .hookType(qry.getHookType())
                .marketingNode(qry.getMarketingNode())
                .status(qry.getStatus())
                .build();
        PageInfo<ContentStructureCard> page = contentStructureCardGateway.listPage(criteria, pageQuery);
        List<ContentStructureCardDTO> dtoList = page.getRecords().stream()
                .map(this::toDTO)
                .toList();
        PageInfo<ContentStructureCardDTO> result = new PageInfo<>();
        result.setPageIndex(page.getPageIndex());
        result.setPageSize(page.getPageSize());
        result.setTotal(page.getTotal());
        result.setRecords(dtoList);
        return result;
    }

    private ContentStructureCardDTO toDTO(ContentStructureCard card) {
        if (card == null) {
            return null;
        }
        return ContentStructureCardDTO.builder()
                .id(card.getId())
                .cardId(card.getCardId())
                .cardVersion(card.getCardVersion())
                .skuId(card.getSkuId())
                .hookType(card.getHookType())
                .targetAudience(card.getTargetAudience())
                .marketingNode(card.getMarketingNode())
                .accountId(card.getAccountId())
                .status(card.getStatus())
                .cardJson(card.getCardJson())
                .openingHook(card.getOpeningHook())
                .videoDurationSec(card.getVideoDurationSec())
                .referenceVideoId(card.getReferenceVideoId())
                .patternRankTop1(card.getPatternRankTop1())
                .logicTrace(card.getLogicTrace())
                .actualLiveGmv(card.getActualLiveGmv())
                .actualCompletion(card.getActualCompletion())
                .actualLiveTraffic(card.getActualLiveTraffic())
                .feedbackWrittenAt(card.getFeedbackWrittenAt())
                .createAt(card.getBaseFields() != null ? card.getBaseFields().getCreateAt() : null)
                .createName(card.getBaseFields() != null ? card.getBaseFields().getCreateName() : null)
                .build();
    }
}
