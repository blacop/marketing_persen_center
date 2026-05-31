package com.beukay.marketing.person.domain.contentStructureCard.ability;

import com.beukay.marketing.person.domain.contentStructureCard.model.ContentStructureCard;

public interface ContentStructureCardDomainService {

    Long create(ContentStructureCard card);

    void update(ContentStructureCard card);

    ContentStructureCard queryById(Long id);

    ContentStructureCard queryByCardId(String cardId);
}
