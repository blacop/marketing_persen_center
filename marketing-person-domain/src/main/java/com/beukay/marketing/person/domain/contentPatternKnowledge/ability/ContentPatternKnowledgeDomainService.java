package com.beukay.marketing.person.domain.contentPatternKnowledge.ability;

import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledge;

public interface ContentPatternKnowledgeDomainService {

    Long create(ContentPatternKnowledge knowledge);

    void update(ContentPatternKnowledge knowledge);

    ContentPatternKnowledge queryById(Long id);

    ContentPatternKnowledge queryByKnowledgeId(String knowledgeId);
}
