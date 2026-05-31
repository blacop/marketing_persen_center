package com.beukay.marketing.person.domain.patternReferenceVideoRel.gateway;

import com.beukay.marketing.person.domain.patternReferenceVideoRel.model.PatternReferenceVideoRel;

import java.util.List;

public interface PatternReferenceVideoRelGateway {

    Long create(PatternReferenceVideoRel rel);

    void softDeleteByKnowledgeId(String knowledgeId);

    List<PatternReferenceVideoRel> listByKnowledgeId(String knowledgeId);
}
