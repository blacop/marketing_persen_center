package com.beukay.marketing.person.app.cutmatrix.liveloop;

import com.beukay.ai.common.entity.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Log4j2
public class CmLiveLoopController {

    private final CmLiveLoopService service;

    /** 拆解直播话术循环：ASR + LLM 识别每轮产品讲解 + 钩子话术高亮 */
    @PostMapping("/cm/live-loop/detect")
    public Result<CmLiveLoopDtos.DetectResult> detect(@RequestBody CmLiveLoopDtos.DetectCmd cmd) {
        return Result.success(service.detect(cmd));
    }

    /** 切片导出选中循环 */
    @PostMapping("/cm/live-loop/export")
    public Result<CmLiveLoopDtos.ExportResult> export(@RequestBody CmLiveLoopDtos.ExportCmd cmd) {
        return Result.success(service.export(cmd));
    }
}
