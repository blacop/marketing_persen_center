package com.beukay.marketing.person.client.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.cmd.ContentPatternKnowledgeAggregateCmd;
import com.beukay.marketing.person.client.dto.ContentPatternKnowledgeDTO;
import com.beukay.marketing.person.client.qry.ContentPatternKnowledgeDetailQry;
import com.beukay.marketing.person.client.qry.ContentPatternKnowledgePageQry;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface ContentPatternKnowledgeFeign {

    @PostMapping("/contentPatternKnowledge/aggregate")
    Result<List<ContentPatternKnowledgeDTO>> aggregateKnowledge(@RequestBody @Valid ContentPatternKnowledgeAggregateCmd cmd);

    @PostMapping("/contentPatternKnowledge/get")
    Result<ContentPatternKnowledgeDTO> getKnowledge(@RequestBody @Valid ContentPatternKnowledgeDetailQry qry);

    @PostMapping("/contentPatternKnowledge/listPage")
    Result<PageInfo<ContentPatternKnowledgeDTO>> listKnowledgePage(@RequestBody @Valid ContentPatternKnowledgePageQry qry);
}
