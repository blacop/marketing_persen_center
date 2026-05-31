package com.beukay.marketing.person.infrastructure.composition.asr;

import com.beukay.marketing.person.infrastructure.composition.render.FfmpegRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

/**
 * 视频抽音轨 + 长音频按时长切块（ASR 单次最大 5 分钟）。
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class AudioExtractor {

    private final FfmpegRunner ffmpegRunner;

    /**
     * 抽音轨为 mp3（mono / 16kHz / 32kbps），让 base64 后 ≤ 10MB。
     */
    public Path extractMp3(Path videoSrc, Path workspace) {
        Path out = workspace.resolve("audio.mp3");
        try { Files.createDirectories(workspace); } catch (IOException ignored) {}
        ffmpegRunner.exec(List.of(
                "-y",
                "-i", videoSrc.toString(),
                "-vn",                       // 不要视频
                "-ac", "1",                  // 单声道
                "-ar", "16000",              // 16 kHz
                "-b:a", "32k",               // 32 kbps
                "-f", "mp3",
                out.toString()
        ), workspace);
        return out;
    }

    /**
     * 把 mp3 按 chunkMs 时长切块。返回 (path, beginMs) 列表，beginMs 为该块在原音频中的起点。
     */
    public List<Chunk> splitBySegment(Path mp3, long chunkMs, Path workspace) {
        Path chunkDir = workspace.resolve("chunks");
        try {
            Files.createDirectories(chunkDir);
            // 清理旧块
            try (Stream<Path> s = Files.list(chunkDir)) {
                s.forEach(p -> { try { Files.deleteIfExists(p); } catch (IOException ignored) {} });
            }
        } catch (IOException ignored) {}

        long secs = Math.max(1, chunkMs / 1000);
        ffmpegRunner.exec(List.of(
                "-y",
                "-i", mp3.toString(),
                "-f", "segment",
                "-segment_time", String.valueOf(secs),
                "-c", "copy",
                chunkDir.resolve("chunk_%03d.mp3").toString()
        ), chunkDir);

        List<Chunk> out = new ArrayList<>();
        try (Stream<Path> s = Files.list(chunkDir)) {
            List<Path> chunks = s
                    .filter(p -> p.getFileName().toString().startsWith("chunk_"))
                    .sorted()
                    .toList();
            for (int i = 0; i < chunks.size(); i++) {
                out.add(new Chunk(chunks.get(i), (long) i * secs * 1000));
            }
        } catch (IOException e) {
            throw new IllegalStateException("list audio chunks failed", e);
        }
        log.info("[asr.split] mp3 split into {} chunks of ≤{}s", out.size(), secs);
        return out;
    }

    public record Chunk(Path path, long beginOffsetMs) {}
}
