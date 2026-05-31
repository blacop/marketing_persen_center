package com.beukay.marketing.person.app.cutmatrix.runtime;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * 本地对象存储（P0）。
 * 后续可替换为 OSS / S3 — 调用方依赖 assetCode 抽象，不直接持有 Path.
 *
 * 目录布局：
 *   {storageRoot}/uploads/{yyyy-MM}/{assetCode}.{ext}    用户上传
 *   {storageRoot}/renders/{yyyy-MM}/{assetCode}.mp4      ffmpeg 输出
 *   {storageRoot}/temp/{taskCode}/                        渲染中间文件
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class CmAssetStorageService {

    private final CmStorageProperties props;

    public StoredAsset uploadFile(MultipartFile file) throws IOException {
        String original = file.getOriginalFilename() == null ? "blob" : file.getOriginalFilename();
        String ext = extractExt(original);
        String code = "asset-" + UUID.randomUUID().toString().replace("-", "");
        Path target = uploadsDir().resolve(code + (ext.isEmpty() ? "" : "." + ext));
        Files.createDirectories(target.getParent());
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        log.info("[CmStorage] uploaded {} -> {}", original, target);
        return new StoredAsset(code, target, file.getSize(), original);
    }

    public Path allocateRenderOutput(String taskCode, String ext) throws IOException {
        Path dir = root().resolve("renders");
        Files.createDirectories(dir);
        return dir.resolve(taskCode + "." + ext);
    }

    public Path allocateTempDir(String taskCode) throws IOException {
        Path dir = root().resolve("temp").resolve(taskCode);
        Files.createDirectories(dir);
        return dir;
    }

    public Path resolveAssetByCode(String code) {
        // 简单线性扫描；P1 切换到 DB 索引
        Path uploads = root().resolve("uploads");
        Path renders = root().resolve("renders");
        Path found = scanForCode(uploads, code);
        if (found != null) return found;
        return scanForCode(renders, code);
    }

    public String streamUrl(String code) {
        return props.getBaseUrl() + "/cm/asset/stream/" + code;
    }

    private Path scanForCode(Path root, String code) {
        if (!Files.isDirectory(root)) return null;
        try (var stream = Files.walk(root)) {
            return stream
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().startsWith(code))
                    .findFirst().orElse(null);
        } catch (IOException e) {
            log.warn("[CmStorage] scan {} failed: {}", root, e.getMessage());
            return null;
        }
    }

    private Path root() {
        return Path.of(props.getStorageRoot()).toAbsolutePath();
    }

    private Path uploadsDir() {
        var ym = java.time.LocalDate.now().toString().substring(0, 7);
        return root().resolve("uploads").resolve(ym);
    }

    private static String extractExt(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot <= 0 || dot == filename.length() - 1) return "";
        return filename.substring(dot + 1).toLowerCase();
    }

    public record StoredAsset(String code, Path path, long size, String originalName) {}
}
