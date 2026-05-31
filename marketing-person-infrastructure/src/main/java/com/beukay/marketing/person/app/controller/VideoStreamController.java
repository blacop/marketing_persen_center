package com.beukay.marketing.person.app.controller;

import com.beukay.marketing.person.infrastructure.service.LocalTempVideoStorageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Map;

/**
 * 本地临时视频文件的流式访问接口，支持 HTTP Range 请求（206 Partial Content）。
 * <p>
 * 浏览器 {@code <video>} 标签播放视频时必须支持 Range 请求，否则 Safari 无法播放，
 * Chrome/Firefox 无法 seek。
 */
@RestController
@RequiredArgsConstructor
@Log4j2
public class VideoStreamController {

    private static final Map<String, String> MIME_MAP = Map.of(
            ".mp4", "video/mp4",
            ".mov", "video/quicktime",
            ".m4v", "video/x-m4v",
            ".avi", "video/x-msvideo",
            ".webm", "video/webm"
    );

    private final LocalTempVideoStorageService localTempVideoStorageService;

    /**
     * 按 taskId 流式返回源视频，支持 HTTP Range（seek / Safari 必需）。
     */
    @GetMapping("/videoUnderstanding/stream/{taskId}")
    public void streamVideo(@PathVariable String taskId,
                            HttpServletRequest request,
                            HttpServletResponse response) throws IOException {

        if (taskId == null || taskId.isBlank() || taskId.contains("..") || taskId.contains("/")) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "invalid taskId");
            return;
        }

        java.util.Optional<Path> videoOpt = localTempVideoStorageService.findSourceVideo(taskId);
        if (videoOpt.isEmpty()) {
            log.warn("视频文件不存在: taskId={}", taskId);
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "video not found");
            return;
        }

        Path videoPath = videoOpt.get();
        String fileName = videoPath.getFileName().toString();
        String ext = fileName.contains(".") ? fileName.substring(fileName.lastIndexOf('.')) : ".mp4";
        String contentType = MIME_MAP.getOrDefault(ext.toLowerCase(Locale.ROOT), "video/mp4");
        long fileSize = Files.size(videoPath);

        // ── 解析 Range 头 ──────────────────────────────────────────────────
        String rangeHeader = request.getHeader("Range");
        long start = 0;
        long end = fileSize - 1;
        boolean isRange = false;

        if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
            isRange = true;
            String rangeSpec = rangeHeader.substring(6);
            String[] parts = rangeSpec.split("-", 2);
            try {
                if (!parts[0].isBlank()) {
                    start = Long.parseLong(parts[0].trim());
                    end = (parts.length > 1 && !parts[1].isBlank())
                            ? Long.parseLong(parts[1].trim())
                            : fileSize - 1;
                } else if (parts.length > 1 && !parts[1].isBlank()) {
                    // suffix range: bytes=-500
                    long suffix = Long.parseLong(parts[1].trim());
                    start = Math.max(0, fileSize - suffix);
                    end = fileSize - 1;
                }
            } catch (NumberFormatException e) {
                response.sendError(416, "invalid Range header");
                return;
            }
        }

        // clamp
        end = Math.min(end, fileSize - 1);
        if (start < 0 || start > end) {
            response.setHeader("Content-Range", "bytes */" + fileSize);
            response.sendError(416, "range not satisfiable");
            return;
        }

        long length = end - start + 1;

        // ── 设置响应头 ──────────────────────────────────────────────────────
        response.setContentType(contentType);
        response.setHeader("Accept-Ranges", "bytes");
        response.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + fileSize);
        response.setContentLengthLong(length);
        response.setHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");

        if (isRange) {
            response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
        } else {
            response.setStatus(HttpServletResponse.SC_OK);
        }

        // ── 写出字节 ────────────────────────────────────────────────────────
        log.debug("视频流: taskId={} range={}-{}/{} contentType={}", taskId, start, end, fileSize, contentType);
        try (FileInputStream fis = new FileInputStream(videoPath.toFile());
             OutputStream out = response.getOutputStream()) {
            long skipped = fis.skip(start);
            if (skipped < start) {
                // fallback: read-and-discard if skip doesn't move far enough
                long remaining = start - skipped;
                byte[] discard = new byte[8192];
                while (remaining > 0) {
                    int r = fis.read(discard, 0, (int) Math.min(discard.length, remaining));
                    if (r < 0) break;
                    remaining -= r;
                }
            }
            byte[] buffer = new byte[65536];
            long remaining = length;
            int read;
            while (remaining > 0 && (read = fis.read(buffer, 0, (int) Math.min(buffer.length, remaining))) != -1) {
                out.write(buffer, 0, read);
                remaining -= read;
            }
        }
    }
}
