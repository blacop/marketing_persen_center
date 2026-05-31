package com.beukay.marketing.person.app.cutmatrix.runtime;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 视频拼接服务（ffmpeg concat）。
 * 输入: 多段 [videoUrl/path, startSec, endSec]
 * 输出: 单一 mp4 文件 (assetCode)
 *
 * 算法：
 *  1. 每段先 trim + 重编码到统一参数（避免 codec/sar/fps 不一致 concat 失败）
 *  2. concat demuxer 拼接
 *  3. 可选叠加配音 (narrationPath) 替换原声
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class CmRenderService {

    private final CmAssetStorageService storage;
    private final CmFFmpegRunner ffmpeg;

    public RenderOutcome concatClips(List<ClipSpec> clips, String narrationAssetCode, RenderOpts opts) throws IOException, InterruptedException {
        if (clips == null || clips.isEmpty()) {
            return RenderOutcome.failed("no clips");
        }
        String taskCode = "cmt-" + UUID.randomUUID().toString().replace("-", "");
        Path tempDir = storage.allocateTempDir(taskCode);

        // step 1: 按段先 trim 到 normalized mp4 ，统一 1080x1920 / 30fps / aac
        int targetW = opts.getTargetWidth() == null ? 1080 : opts.getTargetWidth();
        int targetH = opts.getTargetHeight() == null ? 1920 : opts.getTargetHeight();
        int targetFps = opts.getTargetFps() == null ? 30 : opts.getTargetFps();

        List<Path> segments = new ArrayList<>();
        for (int i = 0; i < clips.size(); i++) {
            ClipSpec clip = clips.get(i);
            Path src = clip.path() != null ? clip.path() : storage.resolveAssetByCode(clip.assetCode());
            if (src == null) {
                log.warn("[CmRender] clip src missing for #{}", i);
                continue;
            }
            Path part = tempDir.resolve(String.format("part_%03d.mp4", i));
            String vf = String.format("scale=w=%d:h=%d:force_original_aspect_ratio=increase,crop=%d:%d,setsar=1,fps=%d",
                    targetW, targetH, targetW, targetH, targetFps);
            List<String> args = new ArrayList<>();
            args.add("-y");
            args.add("-ss"); args.add(String.format("%.3f", clip.startSec()));
            args.add("-i"); args.add(src.toString());
            args.add("-t"); args.add(String.format("%.3f", clip.endSec() - clip.startSec()));
            args.add("-vf"); args.add(vf);
            args.add("-c:v"); args.add("libx264"); args.add("-preset"); args.add("veryfast"); args.add("-crf"); args.add("23");
            args.add("-c:a"); args.add("aac"); args.add("-b:a"); args.add("128k"); args.add("-ar"); args.add("44100");
            args.add(part.toString());
            var r = ffmpeg.runFfmpeg(args);
            if (!r.ok()) {
                log.warn("[CmRender] part {} failed: {}", i, tail(r.stderr()));
                continue;
            }
            segments.add(part);
        }

        if (segments.isEmpty()) return RenderOutcome.failed("all parts failed");

        // step 2: concat demuxer
        Path listFile = tempDir.resolve("list.txt");
        StringBuilder sb = new StringBuilder();
        for (Path p : segments) sb.append("file '").append(p.toString().replace("'", "'\\''")).append("'\n");
        Files.writeString(listFile, sb.toString(), StandardCharsets.UTF_8);

        String outCode = "ren-" + UUID.randomUUID().toString().replace("-", "");
        Path output = storage.allocateRenderOutput(outCode, "mp4");

        Path narration = (narrationAssetCode != null && !narrationAssetCode.isBlank())
                ? storage.resolveAssetByCode(narrationAssetCode) : null;

        List<String> args = new ArrayList<>();
        args.add("-y");
        args.add("-f"); args.add("concat"); args.add("-safe"); args.add("0");
        args.add("-i"); args.add(listFile.toString());
        if (narration != null) {
            args.add("-i"); args.add(narration.toString());
            args.add("-map"); args.add("0:v");
            args.add("-map"); args.add("1:a");
            args.add("-shortest");
            args.add("-c:v"); args.add("copy");
            args.add("-c:a"); args.add("aac"); args.add("-b:a"); args.add("128k");
        } else {
            args.add("-c"); args.add("copy");
        }
        args.add(output.toString());
        var r = ffmpeg.runFfmpeg(args);
        if (!r.ok()) return RenderOutcome.failed("concat failed: " + tail(r.stderr()));

        double totalDur = 0;
        try { totalDur = ffmpeg.probe(output).durationSec(); } catch (Exception ignore) {/**/}

        // 清理 temp（保留 list 文件以便排查；segments 删除节省空间）
        for (Path p : segments) try { Files.deleteIfExists(p); } catch (IOException ignore) {/**/}

        return RenderOutcome.ok(outCode, storage.streamUrl(outCode), totalDur);
    }

    private static String tail(String s) {
        if (s == null) return "";
        return s.length() > 800 ? s.substring(s.length() - 800) : s;
    }

    public record ClipSpec(String assetCode, Path path, double startSec, double endSec) {
        public static ClipSpec ofAsset(String code, double s, double e) { return new ClipSpec(code, null, s, e); }
        public static ClipSpec ofPath(Path p, double s, double e) { return new ClipSpec(null, p, s, e); }
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class RenderOpts {
        private Integer targetWidth;
        private Integer targetHeight;
        private Integer targetFps;
        public static RenderOpts portrait1080() { return new RenderOpts(1080, 1920, 30); }
    }

    public record RenderOutcome(boolean ok, String resultAssetCode, String streamUrl, double durationSec, String errorMsg) {
        public static RenderOutcome ok(String code, String url, double dur) { return new RenderOutcome(true, code, url, dur, null); }
        public static RenderOutcome failed(String err) { return new RenderOutcome(false, null, null, 0, err); }
    }
}
