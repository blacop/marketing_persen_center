package com.beukay.marketing.person.app.composition.controller;

import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.infrastructure.composition.render.CompositionRenderProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import com.beukay.ai.common.exception.GenericBusinessException;
/**
 * OSS 未配置时的本地文件直传 + 流式访问接口。
 * - POST 上传：浏览器 multipart → 落到 workspaceDir/{bizType}/{yyyyMM}/{sha256|uuid}{ext}
 * - GET 访问：根据 local://绝对路径 流式返回，支持 Range（视频拖动）
 * 路径白名单：所有 GET 请求的 key 必须落在 workspaceDir 之下，防越权读任意文件。
 */
@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/composition/local-files")
public class LocalFileController {

    private static final String SCHEME = "local://";
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyyMM");
    private static final Set<String> ALLOWED_BIZ = Set.of("material", "voiceover", "source");

    private final CompositionRenderProperties renderProps;

    @GetMapping
    public ResponseEntity<StreamingResponseBody> serve(
            @RequestParam("key") String key,
            @RequestHeader(value = "Range", required = false) String rangeHeader) throws IOException {

        Path file = resolveAndCheck(key);
        long len = Files.size(file);
        String contentType = guessContentType(file);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ACCEPT_RANGES, "bytes");
        headers.setContentType(MediaType.parseMediaType(contentType));

        if (rangeHeader == null || rangeHeader.isBlank()) {
            StreamingResponseBody body = out -> Files.copy(file, out);
            return ResponseEntity.ok().headers(headers).contentLength(len).body(body);
        }

        List<HttpRange> ranges = HttpRange.parseRanges(rangeHeader);
        HttpRange first = ranges.get(0);
        long start = first.getRangeStart(len);
        long end = first.getRangeEnd(len);
        long contentLen = end - start + 1;

        StreamingResponseBody body = out -> {
            try (RandomAccessFile raf = new RandomAccessFile(file.toFile(), "r")) {
                raf.seek(start);
                byte[] buf = new byte[8192];
                long remaining = contentLen;
                while (remaining > 0) {
                    int read = raf.read(buf, 0, (int) Math.min(buf.length, remaining));
                    if (read < 0) break;
                    out.write(buf, 0, read);
                    remaining -= read;
                }
            }
        };
        headers.add(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + len);
        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .headers(headers).contentLength(contentLen).body(body);
    }

    private static String guessContentType(Path file) throws IOException {
        String probed = Files.probeContentType(file);
        if (probed != null) {
            return probed;
        }
        // Mac 上 probeContentType 经常返回 null，按扩展名兜底
        String name = file.getFileName().toString().toLowerCase();
        if (name.endsWith(".mp4") || name.endsWith(".m4v")) return "video/mp4";
        if (name.endsWith(".mov")) return "video/quicktime";
        if (name.endsWith(".webm")) return "video/webm";
        if (name.endsWith(".mp3")) return "audio/mpeg";
        if (name.endsWith(".wav")) return "audio/wav";
        if (name.endsWith(".m4a")) return "audio/mp4";
        if (name.endsWith(".aac")) return "audio/aac";
        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".webp")) return "image/webp";
        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }

    @PostMapping
    public Result<UploadResult> upload(
            @RequestParam("bizType") String bizType,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (!ALLOWED_BIZ.contains(bizType)) {
            throw new GenericBusinessException("不支持的 bizType: " + bizType);
        }
        if (file.isEmpty()) {
            throw new GenericBusinessException("文件为空");
        }

        String original = Optional.ofNullable(file.getOriginalFilename()).orElse("unnamed");
        String ext = extractExt(original);
        long size = file.getSize();

        Path root = Paths.get(renderProps.getWorkspaceDir()).toAbsolutePath().normalize();
        String month = LocalDate.now().format(MONTH_FMT);
        Path dir = root.resolve(bizType).resolve(month);
        Files.createDirectories(dir);

        // material 用 sha256 命名（自然去重）；voiceover 用 uuid
        String name;
        String sha256;
        if ("material".equals(bizType)) {
            sha256 = sha256Of(file);
            name = sha256 + ext;
        } else {
            sha256 = null;
            name = UUID.randomUUID().toString().replace("-", "") + ext;
        }
        Path target = dir.resolve(name);
        if (!Files.exists(target)) {
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        }

        String ossKey = SCHEME + target.toAbsolutePath();
        log.info("[local-file.upload] bizType={} name={} size={} target={}", bizType, original, size, target);
        return Result.success(new UploadResult(ossKey, original, size, sha256));
    }

    private Path resolveAndCheck(String key) {
        if (key == null || !key.startsWith(SCHEME)) {
            throw new GenericBusinessException("非法 key（缺少 local:// 前缀）");
        }
        Path file = Paths.get(key.substring(SCHEME.length())).toAbsolutePath().normalize();
        Path root = Paths.get(renderProps.getWorkspaceDir()).toAbsolutePath().normalize();
        if (!file.startsWith(root)) {
            throw new SecurityException("路径越权：必须在 workspace 内");
        }
        if (!Files.isRegularFile(file)) {
            throw new GenericBusinessException("文件不存在: " + file);
        }
        return file;
    }

    private static String extractExt(String filename) {
        int idx = filename.lastIndexOf('.');
        if (idx <= 0 || idx == filename.length() - 1) {
            return "";
        }
        String ext = filename.substring(idx).toLowerCase();
        return ext.length() > 8 ? "" : ext;
    }

    private static String sha256Of(MultipartFile file) throws IOException {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            try (InputStream in = file.getInputStream()) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = in.read(buf)) > 0) {
                    md.update(buf, 0, n);
                }
            }
            return HexFormat.of().formatHex(md.digest());
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new GenericBusinessException("SHA-256 不可用" + ": " + e.getMessage());
        }
    }

    public record UploadResult(String ossKey, String originalName, long fileSize, String sha256) {}
}
