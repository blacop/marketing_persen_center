package com.beukay.marketing.person.infrastructure.service;

import com.beukay.ai.common.exception.BadParameterException;
import com.beukay.marketing.person.client.dto.VideoDeconstructionDTO;
import com.beukay.marketing.person.client.dto.VideoDeconstructionTaskDTO;
import jakarta.annotation.PreDestroy;
import lombok.Builder;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

@Component
public class VideoUnderstandingTaskRegistry {

    private final Map<String, TaskState> tasks = new ConcurrentHashMap<>();
    private final Executor executor;
    private final Clock clock;

    public VideoUnderstandingTaskRegistry() {
        this(Executors.newFixedThreadPool(2, runnable -> {
            Thread thread = new Thread(runnable);
            thread.setName("video-understanding-task");
            thread.setDaemon(true);
            return thread;
        }), Clock.systemDefaultZone());
    }

    public VideoUnderstandingTaskRegistry(Executor executor, Clock clock) {
        this.executor = executor;
        this.clock = clock;
    }

    public VideoDeconstructionTaskDTO submit(String taskId,
                                             String sourceType,
                                             String sourceName,
                                             String skuId,
                                             Consumer<String> worker) {
        TaskState state = TaskState.builder()
                .taskId(taskId)
                .status("SUBMITTED")
                .sourceType(sourceType)
                .sourceName(sourceName)
                .skuId(skuId)
                .progressPercent(0)
                .stage("QUEUED")
                .statusMessage("任务已创建，等待执行")
                .createdAt(now())
                .build();
        tasks.put(taskId, state);
        executor.execute(() -> worker.accept(taskId));
        return toDTO(state);
    }

    public VideoDeconstructionTaskDTO get(String taskId) {
        TaskState state = tasks.get(taskId);
        if (state == null) {
            throw new BadParameterException("视频理解任务不存在: " + taskId);
        }
        return toDTO(state);
    }

    public void markRunning(String taskId, int progressPercent, String stage, String statusMessage) {
        update(taskId, state -> state.toBuilder()
                .status("RUNNING")
                .progressPercent(progressPercent)
                .stage(stage)
                .statusMessage(statusMessage)
                .startedAt(state.getStartedAt() == null ? now() : state.getStartedAt())
                .build());
    }

    public void markSucceeded(String taskId, VideoDeconstructionDTO result, String statusMessage) {
        update(taskId, state -> state.toBuilder()
                .status("SUCCEEDED")
                .progressPercent(100)
                .stage("COMPLETED")
                .statusMessage(statusMessage)
                .completedAt(now())
                .errorMessage(null)
                .result(result)
                .build());
    }

    public void markFailed(String taskId, String errorMessage) {
        update(taskId, state -> state.toBuilder()
                .status("FAILED")
                .progressPercent(100)
                .stage("FAILED")
                .statusMessage("任务执行失败")
                .completedAt(now())
                .errorMessage(errorMessage)
                .build());
    }

    private void update(String taskId, java.util.function.Function<TaskState, TaskState> updater) {
        tasks.compute(taskId, (key, current) -> {
            if (current == null) {
                throw new BadParameterException("视频理解任务不存在: " + taskId);
            }
            return updater.apply(current);
        });
    }

    private LocalDateTime now() {
        return LocalDateTime.ofInstant(clock.instant(), ZoneId.systemDefault());
    }

    private VideoDeconstructionTaskDTO toDTO(TaskState state) {
        return VideoDeconstructionTaskDTO.builder()
                .taskId(state.getTaskId())
                .status(state.getStatus())
                .sourceType(state.getSourceType())
                .sourceName(state.getSourceName())
                .skuId(state.getSkuId())
                .progressPercent(state.getProgressPercent())
                .stage(state.getStage())
                .statusMessage(state.getStatusMessage())
                .errorMessage(state.getErrorMessage())
                .createdAt(state.getCreatedAt())
                .startedAt(state.getStartedAt())
                .completedAt(state.getCompletedAt())
                .result(state.getResult())
                .build();
    }

    @PreDestroy
    public void shutdown() {
        if (executor instanceof ExecutorService executorService) {
            executorService.shutdown();
        }
    }

    @Getter
    @Builder(toBuilder = true)
    private static class TaskState {
        private final String taskId;
        private final String status;
        private final String sourceType;
        private final String sourceName;
        private final String skuId;
        private final Integer progressPercent;
        private final String stage;
        private final String statusMessage;
        private final String errorMessage;
        private final LocalDateTime createdAt;
        private final LocalDateTime startedAt;
        private final LocalDateTime completedAt;
        private final VideoDeconstructionDTO result;
    }
}
