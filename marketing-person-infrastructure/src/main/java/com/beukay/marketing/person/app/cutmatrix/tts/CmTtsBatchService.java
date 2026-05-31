package com.beukay.marketing.person.app.cutmatrix.tts;

import com.beukay.marketing.person.app.cutmatrix.runtime.CmAssetStorageService;
import com.beukay.marketing.person.app.cutmatrix.runtime.CmFFmpegRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * tts-batch 业务编排：
 *   - 接收 N 条文案条目
 *   - 并发调 TtsAdapter（默认 4 并发，控制 QPS）
 *   - 每条 mp3 写入 cm-storage，返回 assetCode + streamUrl
 *   - 文件名：<idx>-<name>.mp3
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class CmTtsBatchService {

    private final TtsAdapter tts;
    private final CmAssetStorageService storage;
    private final CmFFmpegRunner ffmpeg;

    /** 并发上限（DashScope qwen-tts 默认 5 QPS，保守设 2 防 rate limit） */
    private static final int CONCURRENCY = 2;
    /** 提交间隔（ms）：限制提交速率，防止瞬间 burst 超过 QPS 限制 */
    private static final long SUBMIT_INTERVAL_MS = 500L;

    public CmTtsBatchDtos.BatchResult batch(CmTtsBatchDtos.BatchCmd cmd) {
        long start = System.currentTimeMillis();
        if (cmd.getItems() == null || cmd.getItems().isEmpty()) {
            return CmTtsBatchDtos.BatchResult.builder()
                    .status("FAILED").errMsg("items 为空").build();
        }
        String voiceId = cmd.getVoiceId() == null ? "longxiaochun" : cmd.getVoiceId();
        double speed = cmd.getSpeed() == null ? 1.0 : cmd.getSpeed();
        String folderName = buildFolderName(cmd.getTitle());

        ExecutorService pool = new ThreadPoolExecutor(
                CONCURRENCY, CONCURRENCY,
                60L, TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(),
                r -> { Thread t = new Thread(r, "tts-batch-worker"); t.setDaemon(true); return t; }
        );
        List<CompletableFuture<CmTtsBatchDtos.BatchResult.FileResult>> futures = new ArrayList<>();
        long lastSubmitMs = 0;

        try {
            for (CmTtsBatchDtos.BatchCmd.Item item : cmd.getItems()) {
                long elapsed = System.currentTimeMillis() - lastSubmitMs;
                if (lastSubmitMs > 0 && elapsed < SUBMIT_INTERVAL_MS) {
                    try {
                        Thread.sleep(SUBMIT_INTERVAL_MS - elapsed);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
                lastSubmitMs = System.currentTimeMillis();
                final var it = item;
                futures.add(CompletableFuture.supplyAsync(() -> synthOne(it, voiceId, speed), pool));
            }

            List<CmTtsBatchDtos.BatchResult.FileResult> files = new ArrayList<>();
            for (CompletableFuture<CmTtsBatchDtos.BatchResult.FileResult> f : futures) {
                try {
                    files.add(f.get());
                } catch (Exception e) {
                    log.error("[TtsBatch] item future failed", e);
                    files.add(CmTtsBatchDtos.BatchResult.FileResult.builder()
                            .status("failed").errMsg(e.getMessage()).build());
                }
            }

            int done = 0, failed = 0;
            for (var f : files) {
                if ("success".equals(f.getStatus())) done++; else failed++;
            }
            String status = failed == 0 ? "SUCCEEDED" : (done > 0 ? "PARTIAL" : "FAILED");
            long elapsed = System.currentTimeMillis() - start;
            log.info("[TtsBatch] {}/{} done in {}ms (provider={})", done, files.size(), elapsed, tts.getClass().getSimpleName());

            return CmTtsBatchDtos.BatchResult.builder()
                    .status(status)
                    .folderName(folderName)
                    .files(files)
                    .provider(tts.getClass().getSimpleName())
                    .elapsedMs(elapsed)
                    .errMsg(failed > 0 ? failed + " 条合成失败" : null)
                    .build();
        } finally {
            pool.shutdown();
            try { pool.awaitTermination(1, TimeUnit.SECONDS); } catch (InterruptedException ignore) { /**/ }
        }
    }

    private CmTtsBatchDtos.BatchResult.FileResult synthOne(CmTtsBatchDtos.BatchCmd.Item item, String voiceId, double speed) {
        try {
            byte[] audio = tts.synth(item.getText(), voiceId, speed);
            String assetCode = "asset-" + UUID.randomUUID().toString().replace("-", "");
            // qwen-tts 返回 wav；cosyvoice 走 native 时返回 mp3。这里统一存 wav。
            Path target = storage.allocateRenderOutput(assetCode, "wav");
            Files.write(target, audio);

            // probe duration
            Double dur = null;
            try { dur = ffmpeg.probe(target).durationSec(); } catch (Exception ignore) { /**/ }

            return CmTtsBatchDtos.BatchResult.FileResult.builder()
                    .shotIdx(item.getShotIdx())
                    .versionIdx(item.getVersionIdx())
                    .name(item.getName())
                    .assetCode(assetCode)
                    .streamUrl(storage.streamUrl(assetCode))
                    .durationSec(dur)
                    .status("success")
                    .build();
        } catch (Exception e) {
            log.warn("[TtsBatch/synth] item shotIdx={} vIdx={} failed: {}",
                    item.getShotIdx(), item.getVersionIdx(), e.getMessage());
            return CmTtsBatchDtos.BatchResult.FileResult.builder()
                    .shotIdx(item.getShotIdx())
                    .versionIdx(item.getVersionIdx())
                    .name(item.getName())
                    .status("failed")
                    .errMsg(e.getMessage())
                    .build();
        }
    }

    public CmTtsBatchDtos.VoiceListResult listVoices() {
        return CmTtsBatchDtos.VoiceListResult.builder()
                .voices(tts.listVoices())
                .provider(tts.getClass().getSimpleName())
                .build();
    }

    private static String buildFolderName(String title) {
        String safe = title == null || title.isBlank() ? "tts" : title.replaceAll("[\\\\/:*?\"<>|]", "_");
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        return String.format("%s-%d%02d%02d-%06d.zip", safe,
                now.getYear(), now.getMonthValue(), now.getDayOfMonth(),
                System.currentTimeMillis() % 1_000_000);
    }
}
