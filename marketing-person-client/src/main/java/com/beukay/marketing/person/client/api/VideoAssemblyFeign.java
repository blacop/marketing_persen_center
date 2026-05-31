package com.beukay.marketing.person.client.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.cmd.VideoAssemblyGenerateCmd;
import com.beukay.marketing.person.client.dto.VideoAssemblyDTO;
import com.beukay.marketing.person.client.qry.VideoAssemblyDetailQry;
import com.beukay.marketing.person.client.qry.VideoAssemblyPageQry;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public interface VideoAssemblyFeign {
    @PostMapping("/videoAssembly/generate")
    Result<VideoAssemblyDTO> generate(@RequestBody @Valid VideoAssemblyGenerateCmd cmd);

    @PostMapping("/videoAssembly/get")
    Result<VideoAssemblyDTO> get(@RequestBody @Valid VideoAssemblyDetailQry qry);

    @PostMapping("/videoAssembly/listPage")
    Result<PageInfo<VideoAssemblyDTO>> listPage(@RequestBody @Valid VideoAssemblyPageQry qry);
}
