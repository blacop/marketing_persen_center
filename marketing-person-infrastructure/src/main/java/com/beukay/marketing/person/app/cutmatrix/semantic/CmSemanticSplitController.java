package com.beukay.marketing.person.app.cutmatrix.semantic;

import com.beukay.ai.common.entity.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Log4j2
public class CmSemanticSplitController {

    private final CmSemanticSplitService service;

    /** 按语义拆解 */
    @PostMapping("/cm/semantic/split")
    public Result<CmSemanticSplitDtos.SplitResult> split(@RequestBody CmSemanticSplitDtos.SplitCmd cmd) {
        return Result.success(service.split(cmd));
    }

    /** 批量切片导出（mp4 + 剪映 draft） */
    @PostMapping("/cm/semantic/export")
    public Result<CmSemanticSplitDtos.ExportResult> export(@RequestBody CmSemanticSplitDtos.ExportCmd cmd) {
        return Result.success(service.export(cmd));
    }
}
