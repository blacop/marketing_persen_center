package com.beukay.marketing.person.domain.contentStructureCard.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.contentStructureCard.model.ContentStructureCard;
import com.beukay.marketing.person.domain.contentStructureCard.model.ContentStructureCardListCriteriaQuery;

public interface ContentStructureCardGateway {

    Long create(ContentStructureCard card);

    void update(ContentStructureCard card);

    ContentStructureCard queryById(Long id);

    ContentStructureCard queryByCardId(String cardId);

    PageInfo<ContentStructureCard> listPage(ContentStructureCardListCriteriaQuery criteriaQuery, PageQuery pageQuery);
}
