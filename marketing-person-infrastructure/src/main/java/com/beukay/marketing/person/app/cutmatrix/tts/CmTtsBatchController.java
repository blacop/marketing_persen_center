package com.beukay.marketing.person.app.cutmatrix.tts;

import com.beukay.ai.common.entity.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Log4j2
public class CmTtsBatchController {

    private final CmTtsBatchService service;

    /** 批量语音合成 */
    @PostMapping("/cm/tts/batch")
    public Result<CmTtsBatchDtos.BatchResult> batch(@RequestBody CmTtsBatchDtos.BatchCmd cmd) {
        return Result.success(service.batch(cmd));
    }

    /** 可用音色列表 */
    @GetMapping("/cm/tts/voices")
    public Result<CmTtsBatchDtos.VoiceListResult> voices() {
        return Result.success(service.listVoices());
    }
}
