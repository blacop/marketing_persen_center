package com.beukay.marketing.person.app.composition.executor;

import com.beukay.marketing.person.app.composition.convertor.CompositionDTOConvertor;
import com.beukay.marketing.person.client.composition.cmd.CreateSourceVideoCmd;
import com.beukay.marketing.person.client.composition.cmd.ImportSourceVideoFromUrlCmd;
import com.beukay.marketing.person.client.composition.cmd.UpdateSegmentsCmd;
import com.beukay.marketing.person.client.composition.dto.SourceVideoDTO;
import com.beukay.marketing.person.client.composition.enums.MaterialKind;
import com.beukay.marketing.person.client.composition.enums.MaterialSourceType;
import com.beukay.marketing.person.domain.composition.ability.MaterialClipService;
import com.beukay.marketing.person.domain.composition.ability.SourceVideoService;
import com.beukay.marketing.person.domain.composition.model.MaterialClip;
import com.beukay.marketing.person.domain.composition.model.SourceVideo;
import com.beukay.marketing.person.infrastructure.composition.asr.AutoSplitOrchestrator;
import com.beukay.marketing.person.infrastructure.composition.render.CompositionRenderProperties;
import com.beukay.marketing.person.infrastructure.composition.render.FfmpegRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLDecoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import com.beukay.ai.common.exception.GenericBusinessException;
@Component
@RequiredArgsConstructor
@Log4j2
public class SourceVideoCmdExecutor {

    private static final String LOCAL_SCHEME = "local://";
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyyMM");

    private final SourceVideoService sourceVideoService;
    private final MaterialClipService materialClipService;
    private final FfmpegRunner ffmpegRunner;
    private final CompositionRenderProperties renderProps;
    private final AutoSplitOrchestrator autoSplitOrchestrator;

    /**
     * 通过 URL 导入：后端流式下载视频 → 落本地 → ffprobe 探测元信息 → 入库
     */
    public SourceVideoDTO importFromUrl(ImportSourceVideoFromUrlCmd cmd) {
        String url = cmd.getUrl().trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            throw new GenericBusinessException("URL 必须以 http:// 或 https:// 开头");
        }

        // 落到 workspaceDir/source/yyyyMM/{uuid}{ext}
        Path dir = Paths.get(renderProps.getWorkspaceDir(), "source",
                LocalDate.now().format(MONTH_FMT));
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new GenericBusinessException("create source dir failed" + ": " + e.getMessage());
        }

        String suggestedName = cmd.getOriginalName() != null && !cmd.getOriginalName().isBlank()
                ? cmd.getOriginalName().trim()
                : extractFilenameFromUrl(url);
        String ext = pickExtension(suggestedName, ".mp4");
        Path target = dir.resolve(UUID.randomUUID().toString().replace("-", "") + ext);

        long size;
        try {
            size = downloadToFile(url, target);
        } catch (IOException | InterruptedException e) {
            try { Files.deleteIfExists(target); } catch (IOException ignored) {}
            if (e instanceof InterruptedException) Thread.currentThread().interrupt();
            throw new GenericBusinessException("下载 URL 失败：" + e.getMessage() + ": " + e.getMessage());
        }
        log.info("[source-video.import-url] url={} size={}KB target={}", url, size / 1024, target);

        // ffprobe 探测时长 / 宽高（失败不阻塞入库）
        Long durationMs = null;
        Integer width = null, height = null;
        try {
            String dim = ffmpegRunner.probe(List.of(
                    "-v", "error", "-select_streams", "v:0",
                    "-show_entries", "stream=width,height",
                    "-of", "csv=p=0", target.toString()
            ), dir).trim();
            if (dim.contains(",")) {
                String[] parts = dim.split(",");
                try { width = Integer.parseInt(parts[0].trim()); } catch (Exception ignored) {}
                try { height = Integer.parseInt(parts[1].trim()); } catch (Exception ignored) {}
            }
            String dur = ffmpegRunner.probe(List.of(
                    "-v", "error", "-show_entries", "format=duration",
                    "-of", "default=nw=1:nk=1", target.toString()
            ), dir).trim();
            try { durationMs = (long) (Double.parseDouble(dur) * 1000); } catch (Exception ignored) {}
        } catch (Exception e) {
            log.warn("[source-video.import-url] probe failed: {}", e.getMessage());
        }

        SourceVideo entity = SourceVideo.builder()
                .ossKey(LOCAL_SCHEME + target.toAbsolutePath())
                .originalName(suggestedName)
                .durationMs(durationMs)
                .fileSize(size)
                .width(width).height(height)
                .segments(new ArrayList<>())
                .status("DRAFT")
                .build();
        SourceVideo saved = sourceVideoService.create(entity);
        return CompositionDTOConvertor.INSTANCE.toSourceVideoDTO(saved);
    }

    private long downloadToFile(String url, Path target) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .connectTimeout(Duration.ofSeconds(30))
                .build();
        HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofMinutes(10))
                .header("User-Agent", "marketing-person-center/1.0")
                .GET()
                .build();
        HttpResponse<Path> resp = client.send(req, HttpResponse.BodyHandlers.ofFile(target));
        if (resp.statusCode() / 100 != 2) {
            throw new IOException("HTTP " + resp.statusCode());
        }
        return Files.size(target);
    }

    private static String extractFilenameFromUrl(String url) {
        try {
            URI u = URI.create(url);
            String path = u.getPath();
            if (path == null || path.isBlank()) return "remote-video.mp4";
            int slash = path.lastIndexOf('/');
            String name = slash >= 0 ? path.substring(slash + 1) : path;
            name = URLDecoder.decode(name, StandardCharsets.UTF_8);
            return name.isBlank() ? "remote-video.mp4" : name;
        } catch (Exception e) {
            return "remote-video.mp4";
        }
    }

    private static String pickExtension(String filename, String fallback) {
        int dot = filename == null ? -1 : filename.lastIndexOf('.');
        if (dot <= 0 || dot == filename.length() - 1) return fallback;
        String ext = filename.substring(dot).toLowerCase();
        return ext.length() > 8 ? fallback : ext;
    }

    public SourceVideoDTO create(CreateSourceVideoCmd cmd) {
        SourceVideo entity = SourceVideo.builder()
                .ossKey(cmd.getOssKey())
                .originalName(cmd.getOriginalName())
                .durationMs(cmd.getDurationMs())
                .fileSize(cmd.getFileSize())
                .width(cmd.getWidth())
                .height(cmd.getHeight())
                .segments(new ArrayList<>())
                .status("DRAFT")
                .build();
        SourceVideo saved = sourceVideoService.create(entity);
        log.info("[source-video.create] id={} ossKey={}", saved.getId(), saved.getOssKey());
        return CompositionDTOConvertor.INSTANCE.toSourceVideoDTO(saved);
    }

    public SourceVideoDTO updateSegments(Long id, UpdateSegmentsCmd cmd) {
        List<SourceVideo.Segment> segs = new ArrayList<>();
        for (UpdateSegmentsCmd.SegmentInput in : cmd.getSegments()) {
            segs.add(SourceVideo.Segment.builder()
                    .startMs(in.getStartMs()).endMs(in.getEndMs())
                    .category(in.getCategory()).name(in.getName()).memo(in.getMemo())
                    .materialClipId(in.getMaterialClipId())
                    .build());
        }
        SourceVideo updated = sourceVideoService.updateSegments(id, segs);
        return CompositionDTOConvertor.INSTANCE.toSourceVideoDTO(updated);
    }

    /**
     * 切片导出：按 segments 用 ffmpeg 切出 mp4 → 入素材库 → materialClipId 回填到对应 segment。
     * 已带 materialClipId 的片段视为已导出，跳过。
     */
    public SourceVideoDTO exportSplit(Long id) {
        SourceVideo source = sourceVideoService.getById(id);
        if (source == null) {
            throw new GenericBusinessException("source video not found: " + id);
        }
        if (source.getSegments() == null || source.getSegments().isEmpty()) {
            throw new GenericBusinessException("no segments to export");
        }
        Path srcPath = resolveLocalPath(source.getOssKey());

        Path outDir = Paths.get(renderProps.getWorkspaceDir(), "material",
                LocalDate.now().format(MONTH_FMT));
        try {
            Files.createDirectories(outDir);
        } catch (IOException e) {
            throw new GenericBusinessException("create out dir failed" + ": " + e.getMessage());
        }

        int succ = 0, skip = 0;
        for (SourceVideo.Segment seg : source.getSegments()) {
            if (seg.getMaterialClipId() != null) { skip++; continue; }
            if (seg.getStartMs() == null || seg.getEndMs() == null
                    || seg.getEndMs() <= seg.getStartMs()) {
                log.warn("[source-video.split] skip invalid segment: {}", seg);
                continue;
            }
            if (seg.getCategory() == null || seg.getCategory().isBlank()) {
                throw new GenericBusinessException("segment missing category, please assign first");
            }
            try {
                Long clipId = cutAndImport(source, seg, srcPath, outDir);
                seg.setMaterialClipId(clipId);
                succ++;
            } catch (Exception e) {
                log.error("[source-video.split] cut failed seg={}", seg, e);
                throw new GenericBusinessException("cut failed at " + seg.getStartMs() + "ms: " + e.getMessage() + ": " + e.getMessage());
            }
        }
        // 回填 materialClipId 到 segments_json + 状态置 EXPORTED
        sourceVideoService.updateSegments(id, source.getSegments());
        sourceVideoService.updateStatus(id, "EXPORTED");
        log.info("[source-video.split] done id={} success={} skip={}", id, succ, skip);
        return CompositionDTOConvertor.INSTANCE.toSourceVideoDTO(sourceVideoService.getById(id));
    }

    public void delete(Long id) {
        sourceVideoService.delete(id);
    }

    /**
     * 自动拆解：抽音 → ASR → LLM 归类 → 写 segments_json。结果是 DRAFT，用户审核后可手动调整再「批量切片导出」。
     */
    public SourceVideoDTO autoSplit(Long id) {
        SourceVideo source = sourceVideoService.getById(id);
        if (source == null) {
            throw new GenericBusinessException("source video not found: " + id);
        }
        try {
            List<SourceVideo.Segment> segments = autoSplitOrchestrator.autoSplit(source);
            if (segments.isEmpty()) {
                throw new GenericBusinessException("自动拆解未识别到有效片段（音频可能太短或无人声）");
            }
            // VAD 模式覆盖整个时间轴 → 直接全量替换。已导出的旧片段时间戳跟新结果会冲突，丢弃。
            // material_clip 表里的素材本身不会被删，只是 segment 关联会重置。
            segments.sort((a, b) -> Long.compare(a.getStartMs(), b.getStartMs()));
            sourceVideoService.updateSegments(id, segments);
            log.info("[source-video.auto-split] done id={} segments={} (replaced)", id, segments.size());
            return CompositionDTOConvertor.INSTANCE.toSourceVideoDTO(sourceVideoService.getById(id));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new GenericBusinessException("自动拆解被中断" + ": " + e.getMessage());
        } catch (Exception e) {
            log.error("[source-video.auto-split] failed id={}", id, e);
            throw new GenericBusinessException("自动拆解失败：" + e.getMessage() + ": " + e.getMessage());
        }
    }

    /** ffmpeg 切片：粗 seek（关键帧对齐，速度快），输出加 +faststart */
    private Long cutAndImport(SourceVideo source, SourceVideo.Segment seg, Path src, Path outDir) throws IOException {
        double startSec = seg.getStartMs() / 1000.0;
        double durSec = (seg.getEndMs() - seg.getStartMs()) / 1000.0;
        // 临时输出（先用 uuid 命名，sha256 出来后再 rename）
        String tmpName = "split_" + System.currentTimeMillis() + "_"
                + Math.abs(seg.hashCode()) + ".mp4";
        Path tmp = outDir.resolve(tmpName);
        ffmpegRunner.exec(List.of(
                "-y",
                "-ss", String.format("%.3f", startSec),
                "-i", src.toString(),
                "-t", String.format("%.3f", durSec),
                "-c", "copy",
                "-movflags", "+faststart",
                "-avoid_negative_ts", "make_zero",
                tmp.toString()
        ), outDir);

        String sha = sha256Of(tmp);
        Path finalPath = outDir.resolve(sha + ".mp4");
        if (Files.exists(finalPath)) {
            Files.delete(tmp);
        } else {
            Files.move(tmp, finalPath, StandardCopyOption.REPLACE_EXISTING);
        }

        long size = Files.size(finalPath);
        String segName = (seg.getName() != null && !seg.getName().isBlank())
                ? seg.getName()
                : (source.getOriginalName() == null ? "split" : source.getOriginalName())
                  + "_" + seg.getStartMs() + "-" + seg.getEndMs();

        MaterialClip clip = MaterialClip.builder()
                .ossKey(LOCAL_SCHEME + finalPath.toAbsolutePath())
                .kind(MaterialKind.VIDEO.name())
                .originalName(segName)
                .durationMs(seg.getEndMs() - seg.getStartMs())
                .width(source.getWidth())
                .height(source.getHeight())
                .fileSize(size)
                .sha256(sha)
                .sourceType(MaterialSourceType.DECONSTRUCTION_AGENT.name())
                .sourceExtra("{\"sourceVideoId\":" + source.getId()
                        + ",\"startMs\":" + seg.getStartMs()
                        + ",\"endMs\":" + seg.getEndMs() + "}")
                .category(seg.getCategory())
                .build();
        MaterialClip saved = materialClipService.create(clip, List.of());
        return saved.getId();
    }

    private Path resolveLocalPath(String ossKey) {
        if (ossKey == null || !ossKey.startsWith(LOCAL_SCHEME)) {
            throw new GenericBusinessException("source video must be local://, got: " + ossKey);
        }
        Path p = Paths.get(ossKey.substring(LOCAL_SCHEME.length()));
        if (!Files.isRegularFile(p)) {
            throw new GenericBusinessException("source file missing: " + p);
        }
        return p;
    }

    private static String sha256Of(Path file) throws IOException {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            try (InputStream in = Files.newInputStream(file)) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = in.read(buf)) > 0) {
                    md.update(buf, 0, n);
                }
            }
            return HexFormat.of().formatHex(md.digest());
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new GenericBusinessException("SHA-256 unavailable" + ": " + e.getMessage());
        }
    }
}
