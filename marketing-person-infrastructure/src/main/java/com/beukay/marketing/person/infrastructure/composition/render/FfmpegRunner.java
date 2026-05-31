package com.beukay.marketing.person.infrastructure.composition.render;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * FFmpeg 执行器（自封装 ProcessBuilder）。
 *
 * 不依赖 jaffree / ffmpeg-cli-wrapper。
 * 失败时抛 RuntimeException，调用方决定状态写回。
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class FfmpegRunner {

    private final CompositionRenderProperties props;

    /**
     * 执行 ffmpeg。
     * @param args  ffmpeg 命令行参数（不含可执行名本身）
     * @param cwd   工作目录
     */
    public void exec(List<String> args, Path cwd) {
        run(props.getFfmpegPath(), args, cwd, props.getOutputTimeoutSeconds());
    }

    /**
     * 执行 ffmpeg 并返回 stdout/stderr 合并文本（用于 silencedetect 这类把诊断写到 stderr 的滤镜）。
     */
    public String execCaptureOutput(List<String> args, Path cwd) {
        List<String> cmd = new ArrayList<>(args.size() + 1);
        cmd.add(props.getFfmpegPath());
        cmd.addAll(args);
        log.info("[ffmpeg] {}", String.join(" ", cmd));
        ProcessBuilder pb = new ProcessBuilder(cmd).redirectErrorStream(true);
        if (cwd != null) pb.directory(cwd.toFile());
        try {
            Process p = pb.start();
            String out = readAll(p.getInputStream());
            boolean ok = p.waitFor(props.getOutputTimeoutSeconds(), TimeUnit.SECONDS);
            if (!ok) {
                p.destroyForcibly();
                throw new IllegalStateException("ffmpeg timeout");
            }
            return out;
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("ffmpeg failed: " + e.getMessage(), e);
        }
    }

    /**
     * 执行 ffprobe。返回完整 stdout。
     */
    public String probe(List<String> args, Path cwd) {
        List<String> cmd = new ArrayList<>(args.size() + 1);
        cmd.add(props.getFfprobePath());
        cmd.addAll(args);
        ProcessBuilder pb = new ProcessBuilder(cmd).redirectErrorStream(true);
        if (cwd != null) pb.directory(cwd.toFile());
        try {
            Process p = pb.start();
            String out = readAll(p.getInputStream());
            boolean ok = p.waitFor(60, TimeUnit.SECONDS);
            if (!ok) {
                p.destroyForcibly();
                throw new IllegalStateException("ffprobe timeout");
            }
            if (p.exitValue() != 0) {
                throw new IllegalStateException("ffprobe exit " + p.exitValue() + ": " + out);
            }
            return out;
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("ffprobe failed: " + e.getMessage(), e);
        }
    }

    private void run(String exec, List<String> args, Path cwd, int timeoutSec) {
        List<String> cmd = new ArrayList<>(args.size() + 1);
        cmd.add(exec);
        cmd.addAll(args);
        log.info("[ffmpeg] {}", String.join(" ", cmd));
        ProcessBuilder pb = new ProcessBuilder(cmd).redirectErrorStream(true);
        if (cwd != null) pb.directory(cwd.toFile());
        try {
            Process p = pb.start();
            // 抽干 stdout，避免阻塞
            String tail = readAll(p.getInputStream());
            boolean ok = p.waitFor(timeoutSec, TimeUnit.SECONDS);
            if (!ok) {
                p.destroyForcibly();
                throw new IllegalStateException("ffmpeg timeout (" + timeoutSec + "s)");
            }
            if (p.exitValue() != 0) {
                String last = tail.length() > 4000 ? tail.substring(tail.length() - 4000) : tail;
                throw new IllegalStateException("ffmpeg exit " + p.exitValue() + ": " + last);
            }
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("ffmpeg failed: " + e.getMessage(), e);
        }
    }

    private String readAll(InputStream in) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader r = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            String line;
            while ((line = r.readLine()) != null) {
                sb.append(line).append('\n');
            }
        }
        return sb.toString();
    }
}
