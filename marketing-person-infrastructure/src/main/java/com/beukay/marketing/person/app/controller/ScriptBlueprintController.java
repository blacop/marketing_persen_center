package com.beukay.marketing.person.app.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.executor.ScriptBlueprintCmdExecutor;
import com.beukay.marketing.person.app.executor.ScriptBlueprintDetailQryExecutor;
import com.beukay.marketing.person.client.api.ScriptBlueprintFeign;
import com.beukay.marketing.person.client.cmd.ScriptBlueprintGenerateCmd;
import com.beukay.marketing.person.client.dto.ScriptBlueprintDTO;
import com.beukay.marketing.person.client.qry.ScriptBlueprintDetailQry;
import com.beukay.marketing.person.client.qry.ScriptBlueprintPageQry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ScriptBlueprintController implements ScriptBlueprintFeign {

    private final ScriptBlueprintCmdExecutor scriptBlueprintCmdExecutor;
    private final ScriptBlueprintDetailQryExecutor scriptBlueprintDetailQryExecutor;

    @Override
    public Result<ScriptBlueprintDTO> generate(ScriptBlueprintGenerateCmd cmd) {
        return Result.success(scriptBlueprintCmdExecutor.generate(cmd));
    }

    @Override
    public Result<ScriptBlueprintDTO> get(ScriptBlueprintDetailQry qry) {
        if (qry.getBlueprintCode() != null && !qry.getBlueprintCode().isBlank()) {
            return Result.success(scriptBlueprintDetailQryExecutor.getByBlueprintCode(qry.getBlueprintCode()));
        }
        return Result.success(scriptBlueprintDetailQryExecutor.getById(qry.getId()));
    }

    @Override
    public Result<PageInfo<ScriptBlueprintDTO>> list(ScriptBlueprintPageQry qry) {
        return Result.success(scriptBlueprintDetailQryExecutor.listByPage(qry));
    }
}
