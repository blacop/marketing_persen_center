package com.beukay.marketing.person.app.composition.controller;

import com.beukay.marketing.person.infrastructure.composition.render.RenderProgressEmitter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** 渲染进度 SSE 端点 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/render-jobs")
public class RenderProgressSseController {

    private final RenderProgressEmitter renderProgressEmitter;

    @GetMapping(value = "/{id}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable("id") Long id) {
        return renderProgressEmitter.register(id);
    }
}
