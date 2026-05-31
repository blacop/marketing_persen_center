package com.beukay.marketing.person.app.cutmatrix.script;

import com.beukay.ai.common.entity.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Log4j2
public class CmScriptFissionController {

    private final CmScriptFissionService service;

    @PostMapping("/cm/script/fission")
    public Result<CmScriptFissionDtos.FissionResult> fission(@RequestBody CmScriptFissionDtos.FissionCmd cmd) {
        return Result.success(service.fission(cmd));
    }

    /** 智能拆解：LLM 切分镜，正则兜底 */
    @PostMapping("/cm/script/decompose")
    public Result<CmScriptFissionDtos.DecomposeResult> decompose(@RequestBody CmScriptFissionDtos.DecomposeCmd cmd) {
        return Result.success(service.decompose(cmd));
    }

    /** AI 文案调整：脚本迁移 + 加码（接受 productUrl 抽取信息 + 用户指令） */
    @PostMapping("/cm/script/adjust")
    public Result<CmScriptFissionDtos.AdjustResult> adjust(@RequestBody CmScriptFissionDtos.AdjustCmd cmd) {
        return Result.success(service.adjust(cmd));
    }
}
