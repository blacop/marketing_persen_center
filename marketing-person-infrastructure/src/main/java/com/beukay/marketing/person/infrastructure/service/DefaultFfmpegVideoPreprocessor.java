package com.beukay.marketing.person.infrastructure.service;

import com.beukay.ai.common.exception.BadParameterException;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Component
public class DefaultFfmpegVideoPreprocessor implements FfmpegVideoPreprocessor {

    @Override
    public PreparedVideoAssets prepare(Path sourceVideoPath) {
        try {
            int durationSec = probeDuration(sourceVideoPath);
            Path taskRoot = sourceVideoPath.getParent().getParent();
            Path framesDir = taskRoot.resolve("frames");
            Path audioDir = taskRoot.resolve("audio");
            Files.createDirectories(framesDir);
            Files.createDirectories(audioDir);

            List<Integer> timestamps = sampleTimestamps(durationSec);
            List<KeyFrameAsset> keyFrames = new ArrayList<>();
            for (int i = 0; i < timestamps.size(); i++) {
                int timestampSec = timestamps.get(i);
                Path framePath = framesDir.resolve(String.format("frame-%02d.jpg", i + 1));
                runCommand(List.of(
                        "ffmpeg",
                        "-y",
                        "-ss", String.valueOf(timestampSec),
                        "-i", sourceVideoPath.toString(),
                        "-frames:v", "1",
                        framePath.toString()
                ));
                keyFrames.add(new KeyFrameAsset(i + 1, timestampSec, framePath));
            }

            Path audioPath = audioDir.resolve("audio.mp3");
            runCommand(List.of(
                    "ffmpeg",
                    "-y",
                    "-i", sourceVideoPath.toString(),
                    "-vn",
                    "-ac", "1",
                    "-ar", "16000",
                    audioPath.toString()
            ));
            return new PreparedVideoAssets(sourceVideoPath, audioPath, durationSec, keyFrames);
        } catch (IOException | InterruptedException e) {
            throw new IllegalStateException("视频预处理失败", e);
        }
    }

    private int probeDuration(Path sourceVideoPath) throws IOException, InterruptedException {
        ProcessResult result = runCommand(List.of(
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                sourceVideoPath.toString()
        ));
        String output = result.stdout().trim();
        if (output.isBlank()) {
            throw new BadParameterException("ffprobe 未返回视频时长");
        }
        return Math.max(1, (int) Math.ceil(Double.parseDouble(output)));
    }

    private List<Integer> sampleTimestamps(int durationSec) {
        List<Integer> timestamps = new ArrayList<>();
        int frameCount = Math.min(6, Math.max(1, durationSec));
        for (int i = 1; i <= frameCount; i++) {
            int timestamp = Math.min(durationSec - 1, Math.max(0, (durationSec * i) / (frameCount + 1)));
            timestamps.add(timestamp);
        }
        if (timestamps.isEmpty()) {
            timestamps.add(0);
        }
        return timestamps;
    }

    private ProcessResult runCommand(List<String> command) throws IOException, InterruptedException {
        Process process = new ProcessBuilder(command).redirectErrorStream(true).start();
        byte[] outputBytes = process.getInputStream().readAllBytes();
        int exitCode = process.waitFor();
        String output = new String(outputBytes, StandardCharsets.UTF_8);
        if (exitCode != 0) {
            throw new IOException("命令执行失败: " + String.join(" ", command) + "\n" + output);
        }
        return new ProcessResult(exitCode, output);
    }

    private record ProcessResult(int exitCode, String stdout) {
    }
}
