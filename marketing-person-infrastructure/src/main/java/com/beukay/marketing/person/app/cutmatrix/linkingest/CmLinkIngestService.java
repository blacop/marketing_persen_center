package com.beukay.marketing.person.app.cutmatrix.linkingest;

import com.beukay.marketing.person.app.cutmatrix.linkingest.asr.AsrAdapter;
import com.beukay.marketing.person.app.cutmatrix.linkingest.parser.ParsedMedia;
import com.beukay.marketing.person.app.cutmatrix.linkingest.parser.UrlPlatformResolver;
import com.beukay.marketing.person.app.cutmatrix.runtime.CmAssetStorageService;
import com.beukay.marketing.person.app.cutmatrix.runtime.CmFFmpegRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.beukay.ai.common.exception.GenericBusinessException;
/**
 * link-ingest 业务编排：
 *   parse:      URL → ParsedMedia
 *   download:   ParsedMedia → assetCode (落到 cm-storage)
 *   transcribe: assetCode → captionText（先抽音轨，再 ASR）
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class CmLinkIngestService {

    private final UrlPlatformResolver resolver;
    private final CmAssetStorageService storage;
    private final CmFFmpegRunner ffmpeg;
    private final AsrAdapter asrAdapter;

    private final HttpClient http = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    // ─── Parse ──────────────────────────────────────────────────────────

    public List<CmLinkIngestDtos.ParseResultItem> parse(CmLinkIngestDtos.ParseCmd cmd) {
        boolean strip = !Boolean.FALSE.equals(cmd.getStripEmoji());
        List<CmLinkIngestDtos.ParseResultItem> out = new ArrayList<>();
        for (String url : cmd.getUrls()) {
            try {
                ParsedMedia m = resolver.parse(url);
                String title = m.getTitle();
                if (strip && title != null) title = stripEmoji(title);
                out.add(CmLinkIngestDtos.ParseResultItem.builder()
                        .sourceUrl(url).platform(m.getPlatform()).title(title)
                        .mediaType(m.getMediaType()).mediaUrl(m.getMediaUrl())
                        .durationSec(m.getDurationSec())
                        .build());
            } catch (Exception e) {
                log.warn("[LinkIngest/parse] {} failed: {}", url, e.getMessage());
                out.add(CmLinkIngestDtos.ParseResultItem.builder()
                        .sourceUrl(url).platform("error")
                        .errMsg(e.getMessage())
                        .build());
            }
        }
        return out;
    }

    // ─── Download ───────────────────────────────────────────────────────

    public CmLinkIngestDtos.DownloadResult download(CmLinkIngestDtos.DownloadCmd cmd) {
        String assetCode = "asset-" + UUID.randomUUID().toString().replace("-", "");
        try {
            // 1. 重新解析（防止前端发的 mediaUrl 失效或漏 headers）
            ParsedMedia parsed = resolver.parse(cmd.getSourceUrl());
            String mediaUrl = parsed.getMediaUrl() != null ? parsed.getMediaUrl() : cmd.getMediaUrl();
            String ext = guessExt(mediaUrl, parsed.getMediaType());

            // 2. 流式下载到 storage
            Path target = storage.allocateRenderOutput(assetCode, ext);
            HttpRequest.Builder b = HttpRequest.newBuilder()
                    .uri(URI.create(mediaUrl))
                    .timeout(Duration.ofMinutes(5));
            if (parsed.getDownloadHeaders() != null) {
                for (Map.Entry<String, String> e : parsed.getDownloadHeaders().entrySet()) {
                    b.header(e.getKey(), e.getValue());
                }
            }
            HttpResponse<InputStream> resp = http.send(b.build(), HttpResponse.BodyHandlers.ofInputStream());
            if (resp.statusCode() / 100 != 2) {
                return CmLinkIngestDtos.DownloadResult.builder()
                        .status("FAILED")
                        .errMsg("HTTP " + resp.statusCode() + " 下载失败")
                        .build();
            }
            try (InputStream in = resp.body()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            long size = Files.size(target);

            // 3. probe 时长 + 分辨率
            Double dur = null;
            Integer w = null, h = null;
            try {
                var probe = ffmpeg.probe(target);
                dur = probe.durationSec();
                w = probe.width(); h = probe.height();
            } catch (Exception ignore) { /* */ }

            // 4. 视频源附带：抽纯音频（mp3）+ 抽封面（jpg）
            String audioCode = null, audioStreamUrl = null;
            String thumbCode = null, thumbUrl = null;
            boolean isVideo = "video".equalsIgnoreCase(parsed.getMediaType()) || ext.matches("mp4|mov|mkv|webm|avi|flv|m4v");
            if (isVideo) {
                try {
                    audioCode = "asset-" + UUID.randomUUID().toString().replace("-", "");
                    Path audioPath = storage.allocateRenderOutput(audioCode, "mp3");
                    var ar = ffmpeg.runFfmpeg(List.of(
                            "-y", "-i", target.toString(),
                            "-vn", "-c:a", "libmp3lame", "-b:a", "192k",
                            audioPath.toString()
                    ));
                    if (ar.ok()) {
                        audioStreamUrl = storage.streamUrl(audioCode);
                    } else {
                        log.warn("[LinkIngest/download] audio extract failed: {}", tail(ar.stderr()));
                        audioCode = null;
                    }
                } catch (Exception e) {
                    log.warn("[LinkIngest/download] audio extract exception: {}", e.getMessage());
                    audioCode = null;
                }
                try {
                    thumbCode = "asset-" + UUID.randomUUID().toString().replace("-", "");
                    Path thumbPath = storage.allocateRenderOutput(thumbCode, "jpg");
                    // thumbnail filter 自动选最有代表性的帧（比固定 -ss 1s 抗黑屏）
                    var tr = ffmpeg.runFfmpeg(List.of(
                            "-y", "-i", target.toString(),
                            "-vf", "thumbnail,scale=480:-1",
                            "-frames:v", "1",
                            "-q:v", "2",
                            thumbPath.toString()
                    ));
                    if (tr.ok()) {
                        thumbUrl = storage.streamUrl(thumbCode);
                    } else {
                        log.warn("[LinkIngest/download] thumbnail failed: {}", tail(tr.stderr()));
                        thumbCode = null;
                    }
                } catch (Exception e) {
                    log.warn("[LinkIngest/download] thumbnail exception: {}", e.getMessage());
                    thumbCode = null;
                }
            }

            log.info("[LinkIngest/download] {} -> {} ({} bytes, dur={}s, audio={}, thumb={})",
                    cmd.getSourceUrl(), target, size, dur, audioCode != null, thumbCode != null);
            return CmLinkIngestDtos.DownloadResult.builder()
                    .status("SUCCEEDED")
                    .assetCode(assetCode)
                    .streamUrl(storage.streamUrl(assetCode))
                    .audioAssetCode(audioCode)
                    .audioStreamUrl(audioStreamUrl)
                    .thumbnailAssetCode(thumbCode)
                    .thumbnailUrl(thumbUrl)
                    .sizeBytes(size)
                    .durationSec(dur)
                    .width(w).height(h)
                    .build();
        } catch (Exception e) {
            log.error("[LinkIngest/download] {} failed", cmd.getSourceUrl(), e);
            return CmLinkIngestDtos.DownloadResult.builder()
                    .status("FAILED")
                    .errMsg(e.getMessage())
                    .build();
        }
    }

    private static String tail(String s) {
        if (s == null) return "";
        return s.length() > 300 ? s.substring(s.length() - 300) : s;
    }

    // ─── Transcribe ─────────────────────────────────────────────────────

    public CmLinkIngestDtos.TranscribeResult transcribe(CmLinkIngestDtos.TranscribeCmd cmd) {
        try {
            Path video = storage.resolveAssetByCode(cmd.getInputAssetCode());
            if (video == null) throw new GenericBusinessException("assetCode 不存在: " + cmd.getInputAssetCode());

            // 1. ffmpeg 抽音轨 → wav 16k mono
            String audioCode = "asset-" + UUID.randomUUID().toString().replace("-", "");
            Path audioPath = storage.allocateRenderOutput(audioCode, "wav");
            CmFFmpegRunner.Result r = ffmpeg.runFfmpeg(List.of(
                    "-y", "-i", video.toString(),
                    "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le",
                    audioPath.toString()
            ));
            if (!r.ok()) {
                throw new GenericBusinessException("ffmpeg 抽音失败: exit=" + r.exitCode());
            }

            // 2. ASR
            AsrAdapter.AsrResult asr = asrAdapter.transcribe(audioPath, AsrAdapter.AsrOptions.builder()
                    .lang(cmd.getLang() == null ? "zh" : cmd.getLang())
                    .wordTimestamp(false)
                    .build());

            List<CmLinkIngestDtos.TranscribeResult.Segment> segs = new ArrayList<>();
            if (asr.getSegments() != null) {
                for (AsrAdapter.AsrResult.Segment s : asr.getSegments()) {
                    segs.add(CmLinkIngestDtos.TranscribeResult.Segment.builder()
                            .start(s.getStart()).end(s.getEnd()).text(s.getText()).build());
                }
            }

            return CmLinkIngestDtos.TranscribeResult.builder()
                    .status("SUCCEEDED")
                    .captionText(asr.getText())
                    .segments(segs)
                    .provider(asr.getProvider())
                    .build();
        } catch (Exception e) {
            log.error("[LinkIngest/transcribe] {} failed", cmd.getInputAssetCode(), e);
            return CmLinkIngestDtos.TranscribeResult.builder()
                    .status("FAILED")
                    .errMsg(e.getMessage())
                    .build();
        }
    }

    // ─── helpers ────────────────────────────────────────────────────────

    private static String guessExt(String url, String mediaType) {
        if (url != null) {
            String lower = url.toLowerCase();
            if (lower.contains(".mp4")) return "mp4";
            if (lower.contains(".mov")) return "mov";
            if (lower.contains(".m4v")) return "m4v";
            if (lower.contains(".webm")) return "webm";
            if (lower.contains(".mp3")) return "mp3";
            if (lower.contains(".m4a")) return "m4a";
            if (lower.contains(".wav")) return "wav";
            if (lower.contains(".jpg") || lower.contains(".jpeg")) return "jpg";
            if (lower.contains(".png")) return "png";
        }
        if ("audio".equals(mediaType)) return "mp3";
        if ("image".equals(mediaType)) return "jpg";
        return "mp4";
    }

    private static String stripEmoji(String s) {
        // 简化版：去 surrogate pair + 变体选择符 + 一些常见符号块
        return s.replaceAll("[\\p{So}\\p{Cn}\\uD83C-\\uDBFF\\uDC00-\\uDFFF\\uFE0F‍]", "").trim();
    }
}
