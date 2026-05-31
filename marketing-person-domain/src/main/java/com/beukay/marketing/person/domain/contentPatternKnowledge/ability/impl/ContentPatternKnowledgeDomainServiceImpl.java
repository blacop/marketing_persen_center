package com.beukay.marketing.person.domain.contentPatternKnowledge.ability.impl;

import com.beukay.marketing.person.domain.contentPatternKnowledge.ability.ContentPatternKnowledgeDomainService;
import com.beukay.marketing.person.domain.contentPatternKnowledge.gateway.ContentPatternKnowledgeGateway;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledge;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContentPatternKnowledgeDomainServiceImpl implements ContentPatternKnowledgeDomainService {

    private final ContentPatternKnowledgeGateway contentPatternKnowledgeGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(ContentPatternKnowledge knowledge) {
        return contentPatternKnowledgeGateway.create(knowledge);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(ContentPatternKnowledge knowledge) {
        contentPatternKnowledgeGateway.update(knowledge);
    }

    @Override
    public ContentPatternKnowledge queryById(Long id) {
        return contentPatternKnowledgeGateway.queryById(id);
    }

    @Override
    public ContentPatternKnowledge queryByKnowledgeId(String knowledgeId) {
        return contentPatternKnowledgeGateway.queryByKnowledgeId(knowledgeId);
    }
}
