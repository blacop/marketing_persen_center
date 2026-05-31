package com.beukay.marketing.person.app.cutmatrix.runtime;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * ffmpeg / ffprobe subprocess 封装。
 * 同步执行，返回 exitCode + stderr 摘要 + stdout。
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class CmFFmpegRunner {

    private final CmStorageProperties props;

    public Result runFfmpeg(List<String> args) throws IOException, InterruptedException {
        return run(props.getFfmpegBin(), args, 600);
    }

    public Result runFfprobe(List<String> args) throws IOException, InterruptedException {
        return run(props.getFfprobeBin(), args, 60);
    }

    private Result run(String bin, List<String> args, int timeoutSec) throws IOException, InterruptedException {
        List<String> cmd = new ArrayList<>();
        cmd.add(bin);
        cmd.addAll(args);
        log.info("[ffmpeg] {}", String.join(" ", cmd));
        ProcessBuilder pb = new ProcessBuilder(cmd).redirectErrorStream(false);
        Process p = pb.start();
        StringBuilder stdout = new StringBuilder();
        StringBuilder stderr = new StringBuilder();
        Thread tOut = drain(p.getInputStream(), stdout);
        Thread tErr = drain(p.getErrorStream(), stderr);
        boolean finished = p.waitFor(timeoutSec, TimeUnit.SECONDS);
        if (!finished) {
            p.destroyForcibly();
            throw new IOException("ffmpeg timed out after " + timeoutSec + "s");
        }
        tOut.join(2000);
        tErr.join(2000);
        return new Result(p.exitValue(), stdout.toString(), stderr.toString());
    }

    public ProbeInfo probe(Path file) throws IOException, InterruptedException {
        Result r = runFfprobe(List.of(
                "-v", "error",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                file.toString()
        ));
        if (r.exitCode != 0) throw new IOException("ffprobe failed: " + r.stderr);
        return ProbeInfo.parseJson(r.stdout);
    }

    private static Thread drain(java.io.InputStream is, StringBuilder sink) {
        Thread t = new Thread(() -> {
            try (BufferedReader r = new BufferedReader(new InputStreamReader(is))) {
                String line;
                while ((line = r.readLine()) != null) sink.append(line).append('\n');
            } catch (IOException ignore) {/**/}
        });
        t.setDaemon(true);
        t.start();
        return t;
    }

    public record Result(int exitCode, String stdout, String stderr) {
        public boolean ok() { return exitCode == 0; }
    }

    /** 极简 probe 结果（按需扩展） */
    public record ProbeInfo(double durationSec, int width, int height, double fps, String videoCodec, String audioCodec) {
        static ProbeInfo parseJson(String json) {
            double dur = extractDouble(json, "\"duration\"\\s*:\\s*\"?([0-9.]+)");
            int w = (int) extractDouble(json, "\"width\"\\s*:\\s*([0-9]+)");
            int h = (int) extractDouble(json, "\"height\"\\s*:\\s*([0-9]+)");
            double fps = parseFraction(extractString(json, "\"r_frame_rate\"\\s*:\\s*\"([0-9/]+)\""));
            String vCodec = extractString(json, "\"codec_type\"\\s*:\\s*\"video\"[^}]*?\"codec_name\"\\s*:\\s*\"([^\"]+)\"");
            String aCodec = extractString(json, "\"codec_type\"\\s*:\\s*\"audio\"[^}]*?\"codec_name\"\\s*:\\s*\"([^\"]+)\"");
            return new ProbeInfo(dur, w, h, fps, vCodec, aCodec);
        }
        private static double extractDouble(String s, String regex) {
            var m = java.util.regex.Pattern.compile(regex).matcher(s);
            return m.find() ? Double.parseDouble(m.group(1)) : 0;
        }
        private static String extractString(String s, String regex) {
            var m = java.util.regex.Pattern.compile(regex, java.util.regex.Pattern.DOTALL).matcher(s);
            return m.find() ? m.group(1) : "";
        }
        private static double parseFraction(String f) {
            if (f == null || f.isEmpty()) return 0;
            int slash = f.indexOf('/');
            if (slash < 0) try { return Double.parseDouble(f); } catch (Exception e) { return 0; }
            try {
                double n = Double.parseDouble(f.substring(0, slash));
                double d = Double.parseDouble(f.substring(slash + 1));
                return d == 0 ? 0 : n / d;
            } catch (Exception e) { return 0; }
        }
    }
}
