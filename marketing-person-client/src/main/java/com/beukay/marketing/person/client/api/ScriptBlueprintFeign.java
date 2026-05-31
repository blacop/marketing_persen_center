package com.beukay.marketing.person.client.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.cmd.ScriptBlueprintGenerateCmd;
import com.beukay.marketing.person.client.dto.ScriptBlueprintDTO;
import com.beukay.marketing.person.client.qry.ScriptBlueprintDetailQry;
import com.beukay.marketing.person.client.qry.ScriptBlueprintPageQry;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public interface ScriptBlueprintFeign {

    @PostMapping("/scriptBlueprint/generate")
    Result<ScriptBlueprintDTO> generate(@RequestBody @Valid ScriptBlueprintGenerateCmd cmd);

    @PostMapping("/scriptBlueprint/get")
    Result<ScriptBlueprintDTO> get(@RequestBody @Valid ScriptBlueprintDetailQry qry);

    @PostMapping("/scriptBlueprint/list")
    Result<PageInfo<ScriptBlueprintDTO>> list(@RequestBody @Valid ScriptBlueprintPageQry qry);
}
