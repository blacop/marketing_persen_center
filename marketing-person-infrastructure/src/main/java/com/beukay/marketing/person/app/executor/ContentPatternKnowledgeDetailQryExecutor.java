package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.app.convertor.ContentPatternKnowledgeDTOConvertor;
import com.beukay.marketing.person.client.dto.ContentPatternKnowledgeDTO;
import com.beukay.marketing.person.domain.contentPatternKnowledge.ability.ContentPatternKnowledgeDomainService;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledge;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ContentPatternKnowledgeDetailQryExecutor {

    private final ContentPatternKnowledgeDomainService contentPatternKnowledgeDomainService;

    public ContentPatternKnowledgeDTO getById(Long id) {
        ContentPatternKnowledge knowledge = contentPatternKnowledgeDomainService.queryById(id);
        return knowledge == null ? null : ContentPatternKnowledgeDTOConvertor.INSTANCE.convert(knowledge);
    }
}
