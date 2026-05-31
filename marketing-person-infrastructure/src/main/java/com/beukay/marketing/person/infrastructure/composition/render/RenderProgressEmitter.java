package com.beukay.marketing.person.infrastructure.composition.render;

import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * 渲染进度 SSE 推送。
 * - register(jobId): 给前端订阅创建 emitter
 * - emit(jobId, payload): RenderPipeline / JobOrchestrator 推进度
 *
 * 进程内单实例（同进程渲染）。后续拆分独立 worker 时换成 MQ + bridge consumer。
 */
@Component
@Log4j2
public class RenderProgressEmitter {

    private static final long DEFAULT_TIMEOUT_MS = 30 * 60 * 1000L; // 30 min

    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter register(Long jobId) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT_MS);
        emitters.computeIfAbsent(jobId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        Runnable cleanup = () -> remove(jobId, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(t -> cleanup.run());
        try {
            emitter.send(SseEmitter.event().name("ping").data("{\"jobId\":" + jobId + "}"));
        } catch (IOException ignored) {}
        return emitter;
    }

    public void emit(Long jobId, Object payload) {
        CopyOnWriteArrayList<SseEmitter> list = emitters.get(jobId);
        if (list == null || list.isEmpty()) return;
        for (SseEmitter e : list) {
            try {
                e.send(SseEmitter.event().name("render.progress").data(payload));
            } catch (IOException ex) {
                log.debug("[sse] emit failed jobId={}", jobId, ex);
                remove(jobId, e);
            }
        }
    }

    public void complete(Long jobId, Object finalPayload) {
        CopyOnWriteArrayList<SseEmitter> list = emitters.remove(jobId);
        if (list == null) return;
        for (SseEmitter e : list) {
            try {
                if (finalPayload != null) {
                    e.send(SseEmitter.event().name("render.complete").data(finalPayload));
                }
                e.complete();
            } catch (IOException ignored) {}
        }
    }

    private void remove(Long jobId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> list = emitters.get(jobId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) emitters.remove(jobId);
        }
    }
}
