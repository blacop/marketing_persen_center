package com.beukay.marketing.person.app.service;

import com.beukay.marketing.person.client.dto.VideoDeconstructionDTO;
import com.beukay.marketing.person.client.dto.VideoDeconstructionTaskDTO;
import com.beukay.marketing.person.domain.productTruth.gateway.ProductTruthGateway;
import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.infrastructure.service.FfmpegVideoPreprocessor;
import com.beukay.marketing.person.infrastructure.service.VideoUnderstandingAnalyzer;
import com.beukay.marketing.person.infrastructure.service.VideoUnderstandingTaskRegistry;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayDeque;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.Executor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class VideoUnderstandingTaskAppServiceTest {

    @Test
    void shouldAdvanceTaskFromSubmittedToSucceededWhenAsyncJobCompletes() {
        ManualExecutor executor = new ManualExecutor();
        Clock clock = Clock.fixed(Instant.parse("2026-04-24T10:15:30Z"), ZoneOffset.UTC);
        VideoUnderstandingTaskRegistry registry = new VideoUnderstandingTaskRegistry(executor, clock);
        ProductTruthGateway productTruthGateway = skuId -> ProductTruth.builder()
                .skuId(skuId)
                .productName("种籽气垫2.0")
                .preferredScenes("[\"通勤\",\"旅游\"]")
                .evidencePoints("[\"服帖\",\"遮瑕\"]")
                .targetSkinType("[\"干皮\",\"混干皮\"]")
                .promotionMechanisms("[\"直播间福利\"]")
                .build();
        FfmpegVideoPreprocessor preprocessor = source -> new FfmpegVideoPreprocessor.PreparedVideoAssets(
                source,
                source,
                18,
                List.of(new FfmpegVideoPreprocessor.KeyFrameAsset(1, 0, source))
        );
        VideoUnderstandingAnalyzer analyzer = request -> VideoUnderstandingAnalyzer.VideoUnderstandingAnalysis.builder()
                .summary("模特在室内口播气垫使用场景")
                .transcript("今天试一下种籽气垫")
                .ocrTexts(List.of("12H 持妆", "直播间福利"))
                .frameObservations(List.of(Map.of("timestampSec", 0, "visualSummary", "上脸展示")))
                .hookType("场景植入型")
                .titlePattern("SCENE_SEEDING")
                .sceneTags(List.of("通勤"))
                .sellingPointTags(List.of("服帖"))
                .ctaTags(List.of("直播间福利"))
                .emotionTags(List.of("真实分享"))
                .targetAudienceTags(List.of("干皮"))
                .reasoning("画面出现上脸演示和福利字幕")
                .build();

        VideoUnderstandingTaskAppService service = new VideoUnderstandingTaskAppService(
                registry,
                productTruthGateway,
                preprocessor,
                analyzer);

        VideoDeconstructionTaskDTO submitted = service.submitLocalFile(Path.of("/tmp/demo.mp4"), "demo.mp4", "SEED_CUSHION_2");
        assertEquals("SUBMITTED", submitted.getStatus());
        assertEquals(0, submitted.getProgressPercent());

        executor.runNext();

        VideoDeconstructionTaskDTO finished = service.getTask(submitted.getTaskId());
        assertEquals("SUCCEEDED", finished.getStatus());
        assertEquals(100, finished.getProgressPercent());
        assertNotNull(finished.getCompletedAt());
        assertNotNull(finished.getResult());
        assertEquals("SEED_CUSHION_2", finished.getResult().getSkuId());
        assertEquals("场景植入型", finished.getResult().getHookType());
        assertEquals("TEMP_ANALYZED", finished.getResult().getVerificationStatus());
        assertEquals(BigDecimal.ZERO, finished.getResult().getActualPerformanceScore());
    }

    @Test
    void shouldExposeTaskFailureWhenAnalyzerThrows() {
        ManualExecutor executor = new ManualExecutor();
        Clock clock = Clock.fixed(Instant.parse("2026-04-24T10:15:30Z"), ZoneOffset.UTC);
        VideoUnderstandingTaskRegistry registry = new VideoUnderstandingTaskRegistry(executor, clock);
        ProductTruthGateway productTruthGateway = skuId -> ProductTruth.builder().skuId(skuId).productName("种籽气垫2.0").build();
        FfmpegVideoPreprocessor preprocessor = source -> new FfmpegVideoPreprocessor.PreparedVideoAssets(
                source,
                source,
                12,
                List.of(new FfmpegVideoPreprocessor.KeyFrameAsset(1, 0, source))
        );
        VideoUnderstandingAnalyzer analyzer = request -> {
            throw new IllegalStateException("provider not configured");
        };

        VideoUnderstandingTaskAppService service = new VideoUnderstandingTaskAppService(
                registry,
                productTruthGateway,
                preprocessor,
                analyzer);

        VideoDeconstructionTaskDTO submitted = service.submitLocalFile(Path.of("/tmp/demo.mp4"), "demo.mp4", "SEED_CUSHION_2");
        executor.runNext();

        VideoDeconstructionTaskDTO failed = service.getTask(submitted.getTaskId());
        assertEquals("FAILED", failed.getStatus());
        assertEquals("provider not configured", failed.getErrorMessage());
        assertEquals(100, failed.getProgressPercent());
    }

    private static class ManualExecutor implements Executor {

        private final Queue<Runnable> queue = new ArrayDeque<>();

        @Override
        public void execute(Runnable command) {
            queue.add(command);
        }

        void runNext() {
            Runnable task = queue.poll();
            if (task != null) {
                task.run();
            }
        }
    }
}
