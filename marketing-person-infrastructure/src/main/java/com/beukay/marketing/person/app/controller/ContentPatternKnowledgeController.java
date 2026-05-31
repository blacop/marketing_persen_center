package com.beukay.marketing.person.app.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.executor.ContentPatternKnowledgeCmdExecutor;
import com.beukay.marketing.person.app.executor.ContentPatternKnowledgeDetailQryExecutor;
import com.beukay.marketing.person.app.executor.ContentPatternKnowledgeQryExecutor;
import com.beukay.marketing.person.client.api.ContentPatternKnowledgeFeign;
import com.beukay.marketing.person.client.cmd.ContentPatternKnowledgeAggregateCmd;
import com.beukay.marketing.person.client.dto.ContentPatternKnowledgeDTO;
import com.beukay.marketing.person.client.qry.ContentPatternKnowledgeDetailQry;
import com.beukay.marketing.person.client.qry.ContentPatternKnowledgePageQry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ContentPatternKnowledgeController implements ContentPatternKnowledgeFeign {

    private final ContentPatternKnowledgeCmdExecutor contentPatternKnowledgeCmdExecutor;
    private final ContentPatternKnowledgeDetailQryExecutor contentPatternKnowledgeDetailQryExecutor;
    private final ContentPatternKnowledgeQryExecutor contentPatternKnowledgeQryExecutor;

    @Override
    public Result<List<ContentPatternKnowledgeDTO>> aggregateKnowledge(ContentPatternKnowledgeAggregateCmd cmd) {
        return Result.success(contentPatternKnowledgeCmdExecutor.aggregate(cmd));
    }

    @Override
    public Result<ContentPatternKnowledgeDTO> getKnowledge(ContentPatternKnowledgeDetailQry qry) {
        return Result.success(contentPatternKnowledgeDetailQryExecutor.getById(qry.getId()));
    }

    @Override
    public Result<PageInfo<ContentPatternKnowledgeDTO>> listKnowledgePage(ContentPatternKnowledgePageQry qry) {
        return Result.success(contentPatternKnowledgeQryExecutor.listPage(qry));
    }
}
