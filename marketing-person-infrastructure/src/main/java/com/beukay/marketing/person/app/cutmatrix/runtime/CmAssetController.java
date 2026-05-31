package com.beukay.marketing.person.app.cutmatrix.runtime;

import com.beukay.ai.common.entity.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

/**
 * Cutmatrix 文件上传 + 流式输出（支持 Range，浏览器 <video> 兼容）。
 */
@RestController
@RequiredArgsConstructor
@Log4j2
public class CmAssetController {

    private final CmAssetStorageService storage;

    @PostMapping("/cm/asset/upload")
    public Result<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        var stored = storage.uploadFile(file);
        Map<String, Object> body = new HashMap<>();
        body.put("assetCode", stored.code());
        body.put("size", stored.size());
        body.put("originalName", stored.originalName());
        body.put("streamUrl", storage.streamUrl(stored.code()));
        return Result.success(body);
    }

    @GetMapping("/cm/asset/stream/{code}")
    public ResponseEntity<?> stream(@PathVariable String code,
                                    @RequestHeader(value = "Range", required = false) String range) throws IOException {
        Path file = storage.resolveAssetByCode(code);
        if (file == null || !Files.isRegularFile(file)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("asset not found: " + code);
        }
        long fileLen = Files.size(file);
        String mime = Files.probeContentType(file);
        if (mime == null) mime = "application/octet-stream";

        if (range == null || !range.startsWith("bytes=")) {
            HttpHeaders h = new HttpHeaders();
            h.setContentType(MediaType.parseMediaType(mime));
            h.setContentLength(fileLen);
            h.set("Accept-Ranges", "bytes");
            return ResponseEntity.ok().headers(h).body(new FileSystemResource(file));
        }

        // Range 请求
        String spec = range.substring("bytes=".length());
        long start, end;
        int dash = spec.indexOf('-');
        try {
            start = Long.parseLong(spec.substring(0, dash));
            end = (dash + 1 >= spec.length()) ? fileLen - 1 : Long.parseLong(spec.substring(dash + 1));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).build();
        }
        if (end >= fileLen) end = fileLen - 1;
        long len = end - start + 1;
        byte[] buf = new byte[(int) len];
        try (RandomAccessFile raf = new RandomAccessFile(file.toFile(), "r")) {
            raf.seek(start);
            raf.readFully(buf);
        }
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.parseMediaType(mime));
        h.setContentLength(len);
        h.set("Accept-Ranges", "bytes");
        h.set("Content-Range", "bytes " + start + "-" + end + "/" + fileLen);
        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT).headers(h).body(buf);
    }
}
