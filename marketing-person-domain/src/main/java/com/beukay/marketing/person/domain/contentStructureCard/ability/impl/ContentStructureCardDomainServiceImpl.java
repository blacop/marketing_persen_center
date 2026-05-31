package com.beukay.marketing.person.domain.contentStructureCard.ability.impl;

import com.beukay.marketing.person.domain.contentStructureCard.ability.ContentStructureCardDomainService;
import com.beukay.marketing.person.domain.contentStructureCard.gateway.ContentStructureCardGateway;
import com.beukay.marketing.person.domain.contentStructureCard.model.ContentStructureCard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContentStructureCardDomainServiceImpl implements ContentStructureCardDomainService {

    private final ContentStructureCardGateway contentStructureCardGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(ContentStructureCard card) {
        return contentStructureCardGateway.create(card);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(ContentStructureCard card) {
        contentStructureCardGateway.update(card);
    }

    @Override
    public ContentStructureCard queryById(Long id) {
        return contentStructureCardGateway.queryById(id);
    }

    @Override
    public ContentStructureCard queryByCardId(String cardId) {
        return contentStructureCardGateway.queryByCardId(cardId);
    }
}
