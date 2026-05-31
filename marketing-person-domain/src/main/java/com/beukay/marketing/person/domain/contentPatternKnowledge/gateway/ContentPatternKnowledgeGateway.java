package com.beukay.marketing.person.domain.contentPatternKnowledge.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledge;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledgeListCriteriaQuery;

public interface ContentPatternKnowledgeGateway {

    Long create(ContentPatternKnowledge knowledge);

    void update(ContentPatternKnowledge knowledge);

    ContentPatternKnowledge queryById(Long id);

    ContentPatternKnowledge queryByKnowledgeId(String knowledgeId);

    PageInfo<ContentPatternKnowledge> listPage(ContentPatternKnowledgeListCriteriaQuery criteriaQuery, PageQuery pageQuery);
}
