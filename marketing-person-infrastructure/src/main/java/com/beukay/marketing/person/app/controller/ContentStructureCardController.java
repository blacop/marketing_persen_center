package com.beukay.marketing.person.app.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.executor.ContentStructureCardCmdExecutor;
import com.beukay.marketing.person.app.executor.ContentStructureCardQryExecutor;
import com.beukay.marketing.person.client.api.ContentStructureCardFeign;
import com.beukay.marketing.person.client.cmd.ContentStructureCardGenerateCmd;
import com.beukay.marketing.person.client.dto.ContentStructureCardDTO;
import com.beukay.marketing.person.client.qry.ContentStructureCardDetailQry;
import com.beukay.marketing.person.client.qry.ContentStructureCardPageQry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ContentStructureCardController implements ContentStructureCardFeign {

    private final ContentStructureCardCmdExecutor contentStructureCardCmdExecutor;
    private final ContentStructureCardQryExecutor contentStructureCardQryExecutor;

    @Override
    public Result<ContentStructureCardDTO> generate(ContentStructureCardGenerateCmd cmd) {
        return Result.success(contentStructureCardCmdExecutor.generate(cmd));
    }

    @Override
    public Result<ContentStructureCardDTO> get(ContentStructureCardDetailQry qry) {
        return Result.success(contentStructureCardQryExecutor.get(qry));
    }

    @Override
    public Result<PageInfo<ContentStructureCardDTO>> listPage(ContentStructureCardPageQry qry) {
        return Result.success(contentStructureCardQryExecutor.listPage(qry));
    }
}
