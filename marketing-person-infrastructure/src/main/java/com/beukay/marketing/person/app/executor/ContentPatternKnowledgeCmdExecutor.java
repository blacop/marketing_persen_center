package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.app.convertor.ContentPatternKnowledgeDTOConvertor;
import com.beukay.marketing.person.app.service.ContentPatternKnowledgeBuildAppService;
import com.beukay.marketing.person.client.cmd.ContentPatternKnowledgeAggregateCmd;
import com.beukay.marketing.person.client.dto.ContentPatternKnowledgeDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ContentPatternKnowledgeCmdExecutor {

    private final ContentPatternKnowledgeBuildAppService contentPatternKnowledgeBuildAppService;

    public List<ContentPatternKnowledgeDTO> aggregate(ContentPatternKnowledgeAggregateCmd cmd) {
        return contentPatternKnowledgeBuildAppService.aggregateBySku(
                        cmd.getSkuId(),
                        cmd.getMarketingNode(),
                        cmd.getTargetAudience())
                .stream()
                .map(ContentPatternKnowledgeDTOConvertor.INSTANCE::convert)
                .toList();
    }
}
