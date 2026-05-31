package com.beukay.marketing.person.client.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.cmd.ContentStructureCardGenerateCmd;
import com.beukay.marketing.person.client.dto.ContentStructureCardDTO;
import com.beukay.marketing.person.client.qry.ContentStructureCardDetailQry;
import com.beukay.marketing.person.client.qry.ContentStructureCardPageQry;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public interface ContentStructureCardFeign {

    @PostMapping("/contentStructureCard/generate")
    Result<ContentStructureCardDTO> generate(@RequestBody ContentStructureCardGenerateCmd cmd);

    @PostMapping("/contentStructureCard/get")
    Result<ContentStructureCardDTO> get(@RequestBody ContentStructureCardDetailQry qry);

    @PostMapping("/contentStructureCard/listPage")
    Result<PageInfo<ContentStructureCardDTO>> listPage(@RequestBody ContentStructureCardPageQry qry);
}
