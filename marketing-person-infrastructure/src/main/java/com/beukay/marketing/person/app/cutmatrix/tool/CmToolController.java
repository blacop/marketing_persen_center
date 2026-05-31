package com.beukay.marketing.person.app.cutmatrix.tool;

import com.beukay.ai.common.entity.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Log4j2
public class CmToolController {

    private final CmToolService service;

    @PostMapping("/cm/tool/aspectConvert")
    public Result<CmToolDtos.ToolResultDto> aspectConvert(@RequestBody CmToolDtos.AspectConvertCmd cmd) {
        return runSafe(() -> service.aspectConvert(cmd), "aspectConvert");
    }

    @PostMapping("/cm/tool/audioOps")
    public Result<CmToolDtos.ToolResultDto> audioOps(@RequestBody CmToolDtos.AudioOpsCmd cmd) {
        return runSafe(() -> service.audioOps(cmd), "audioOps");
    }

    @PostMapping("/cm/tool/uniformSplit")
    public Result<CmToolDtos.ToolResultDto> uniformSplit(@RequestBody CmToolDtos.UniformSplitCmd cmd) {
        return runSafe(() -> service.uniformSplit(cmd), "uniformSplit");
    }

    @PostMapping("/cm/tool/silenceFilter")
    public Result<CmToolDtos.ToolResultDto> silenceFilter(@RequestBody CmToolDtos.SilenceFilterCmd cmd) {
        return runSafe(() -> service.silenceFilter(cmd), "silenceFilter");
    }

    @PostMapping("/cm/tool/sceneSplit")
    public Result<CmToolDtos.ToolResultDto> sceneSplit(@RequestBody CmToolDtos.SceneSplitCmd cmd) {
        return runSafe(() -> service.sceneSplit(cmd), "sceneSplit");
    }

    @PostMapping("/cm/tool/subtitleErase")
    public Result<CmToolDtos.ToolResultDto> subtitleErase(@RequestBody CmToolDtos.SubtitleEraseCmd cmd) {
        return runSafe(() -> service.subtitleErase(cmd), "subtitleErase");
    }

    @PostMapping("/cm/tool/subtitleGen")
    public Result<CmToolDtos.ToolResultDto> subtitleGen(@RequestBody CmToolDtos.SubtitleGenCmd cmd) {
        return runSafe(() -> service.subtitleGen(cmd), "subtitleGen");
    }

    @PostMapping("/cm/tool/addBg")
    public Result<CmToolDtos.ToolResultDto> addBg(@RequestBody CmToolDtos.AddBgCmd cmd) {
        return runSafe(() -> service.addBg(cmd), "addBg");
    }

    @PostMapping("/cm/tool/textStyleFission")
    public Result<CmToolDtos.ToolResultDto> textStyleFission(@RequestBody CmToolDtos.TextStyleFissionCmd cmd) {
        return runSafe(() -> service.textStyleFission(cmd), "textStyleFission");
    }

    @FunctionalInterface
    private interface ToolCall { CmToolDtos.ToolResultDto call() throws Exception; }

    private Result<CmToolDtos.ToolResultDto> runSafe(ToolCall fn, String name) {
        try {
            return Result.success(fn.call());
        } catch (Exception e) {
            log.error("[CmTool/{}] failed", name, e);
            return Result.success(CmToolDtos.ToolResultDto.builder()
                    .status("FAILED")
                    .message(name + " 异常: " + e.getMessage())
                    .build());
        }
    }
}
