package com.beukay.marketing.person.infrastructure.service;

import com.beukay.ai.common.exception.BadParameterException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;

@Component
public class LocalTempVideoStorageService {

    private final Path baseDirectory;
    private final HttpClient httpClient;

    public LocalTempVideoStorageService() {
        this(Path.of(System.getProperty("java.io.tmpdir"), "marketing-person-center", "video-understanding"));
    }

    public LocalTempVideoStorageService(Path baseDirectory) {
        this(baseDirectory, HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build());
    }

    LocalTempVideoStorageService(Path baseDirectory, HttpClient httpClient) {
        this.baseDirectory = baseDirectory;
        this.httpClient = httpClient;
    }

    public Path saveUpload(String taskId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BadParameterException("上传视频不能为空");
        }
        String fileName = normalizeFileName(file.getOriginalFilename(), "upload.mp4");
        Path target = taskSourceDir(taskId).resolve(fileName);
        Files.createDirectories(target.getParent());
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        }
        return target;
    }

    public Path downloadRemote(String taskId, String videoUrl) throws IOException, InterruptedException {
        if (videoUrl == null || videoUrl.isBlank()) {
            throw new BadParameterException("视频URL不能为空");
        }
        URI uri = URI.create(videoUrl.trim());
        String fallbackName = buildFileNameFromUrl(uri);
        Path target = taskSourceDir(taskId).resolve(fallbackName);
        Files.createDirectories(target.getParent());

        HttpRequest request = HttpRequest.newBuilder(uri).GET().build();
        HttpResponse<Path> response = httpClient.send(request, HttpResponse.BodyHandlers.ofFile(target));
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("视频下载失败，HTTP状态=" + response.statusCode());
        }
        return target;
    }

    /**
     * 查找任务对应的源视频文件（取目录中第一个视频文件）。
     */
    public java.util.Optional<Path> findSourceVideo(String taskId) {
        Path dir = taskSourceDir(taskId);
        if (!Files.exists(dir) || !Files.isDirectory(dir)) {
            return java.util.Optional.empty();
        }
        try (java.util.stream.Stream<Path> stream = Files.list(dir)) {
            return stream
                    .filter(p -> {
                        String name = p.getFileName().toString().toLowerCase(Locale.ROOT);
                        return name.endsWith(".mp4") || name.endsWith(".mov")
                                || name.endsWith(".m4v") || name.endsWith(".avi")
                                || name.endsWith(".webm");
                    })
                    .findFirst();
        } catch (IOException e) {
            return java.util.Optional.empty();
        }
    }

    private Path taskSourceDir(String taskId) {
        return baseDirectory.resolve(taskId).resolve("source");
    }

    private String buildFileNameFromUrl(URI uri) {
        String path = uri.getPath();
        if (path != null && !path.isBlank()) {
            String candidate = Path.of(path).getFileName().toString();
            if (!candidate.isBlank()) {
                return normalizeFileName(candidate, "remote-video.mp4");
            }
        }
        return "remote-video.mp4";
    }

    private String normalizeFileName(String rawName, String fallback) {
        String candidate = rawName == null ? "" : rawName.trim();
        if (candidate.isBlank()) {
            return fallback;
        }
        candidate = candidate.replace('\\', '_').replace('/', '_');
        String lowerCase = candidate.toLowerCase(Locale.ROOT);
        if (!lowerCase.endsWith(".mp4") && !lowerCase.endsWith(".mov") && !lowerCase.endsWith(".m4v")
                && !lowerCase.endsWith(".avi") && !lowerCase.endsWith(".webm")) {
            return candidate + ".mp4";
        }
        return candidate;
    }
}
