package com.beukay.marketing.person.app.cutmatrix.tool;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 阿里云视觉智能开放平台 - 智能擦除字幕适配器。
 *
 * 调用 EraseVideoSubtitles 接口，用 HMAC-SHA1 RPC 签名认证。
 * 支持指定区域（像素坐标）或全自动检测（regions 为空时触发）。
 *
 * 必须配置：
 *   cm.aliyun.access-key-id
 *   cm.aliyun.access-key-secret
 *
 * 可选配置：
 *   cm.aliyun.erase.endpoint     默认 https://viapi.aliyuncs.com
 *   cm.aliyun.erase.action       默认 EraseVideoSubtitles
 *   cm.aliyun.erase.version      默认 2020-09-10
 *   cm.aliyun.erase.region-id    默认 cn-shanghai
 *
 * 注意：调用时传入的视频 URL 必须可被阿里云公网访问。
 *       本地开发环境需将 cutmatrix.base-url 配置为公网地址。
 */
@Component
@Log4j2
public class AliyunVideoEraseAdapter {

    @Value("${cm.aliyun.access-key-id:}")
    private String accessKeyId;

    @Value("${cm.aliyun.access-key-secret:}")
    private String accessKeySecret;

    @Value("${cm.aliyun.erase.endpoint:https://viapi.aliyuncs.com}")
    private String endpoint;

    @Value("${cm.aliyun.erase.action:EraseVideoSubtitles}")
    private String action;

    @Value("${cm.aliyun.erase.version:2020-09-10}")
    private String apiVersion;

    @Value("${cm.aliyun.erase.region-id:cn-shanghai}")
    private String regionId;

    private static final ObjectMapper JSON = new ObjectMapper();
    private static final DateTimeFormatter ISO8601 =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    /**
     * 提交智能擦除字幕任务，同步等待结果。
     *
     * @param videoUrl 可被阿里云公网访问的视频 URL
     * @param regions  像素区域列表；为空则触发自动字幕检测
     * @return 结果视频 OSS 临时 URL
     */
    public String erase(String videoUrl, List<PixelRegion> regions) throws Exception {
        if (accessKeyId == null || accessKeyId.isBlank()) {
            throw new IllegalStateException("cm.aliyun.access-key-id 未配置，无法使用阿里云智能擦除");
        }
        if (accessKeySecret == null || accessKeySecret.isBlank()) {
            throw new IllegalStateException("cm.aliyun.access-key-secret 未配置");
        }

        Map<String, String> params = new TreeMap<>();
        params.put("Action", action);
        params.put("Format", "JSON");
        params.put("Version", apiVersion);
        params.put("AccessKeyId", accessKeyId);
        params.put("SignatureMethod", "HMAC-SHA1");
        params.put("SignatureVersion", "1.0");
        params.put("SignatureNonce", UUID.randomUUID().toString());
        params.put("Timestamp", ZonedDateTime.now(ZoneOffset.UTC).format(ISO8601));
        params.put("RegionId", regionId);
        params.put("VideoURL", videoUrl);

        if (regions != null && !regions.isEmpty()) {
            ArrayNode arr = JSON.createArrayNode();
            for (PixelRegion r : regions) {
                arr.addObject()
                        .put("X", r.x())
                        .put("Y", r.y())
                        .put("Width", r.w())
                        .put("Height", r.h());
            }
            params.put("SubtitleCoordinate", JSON.writeValueAsString(arr));
            params.put("SubtitleType", "0");
        } else {
            params.put("SubtitleType", "1");
        }

        params.put("Signature", sign(params, accessKeySecret));

        String url = endpoint + "?" + buildQuery(params);
        log.info("[AliyunErase] submit videoUrl={}", videoUrl);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofMinutes(10))
                .GET()
                .build();

        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        String body = resp.body();
        log.debug("[AliyunErase] status={} body={}", resp.statusCode(),
                body.length() > 500 ? body.substring(0, 500) + "..." : body);

        if (resp.statusCode() >= 400) {
            throw new RuntimeException("阿里云 API HTTP " + resp.statusCode()
                    + ": " + body.substring(0, Math.min(300, body.length())));
        }

        JsonNode root = JSON.readTree(body);
        String code = root.path("Code").asText(null);
        if (code != null && !isOk(code)) {
            throw new RuntimeException("阿里云智能擦除失败 [" + code + "]: "
                    + root.path("Message").asText("未知错误"));
        }

        String resultUrl = root.path("Data").path("VideoURL").asText(null);
        if (resultUrl == null || resultUrl.isBlank()) {
            throw new RuntimeException("阿里云智能擦除返回空结果 URL，响应: "
                    + body.substring(0, Math.min(400, body.length())));
        }

        log.info("[AliyunErase] done resultUrl={}", resultUrl);
        return resultUrl;
    }

    /** 从 HTTP URL 下载文件到本地路径。 */
    public void downloadToPath(String srcUrl, Path dest) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(srcUrl))
                .timeout(Duration.ofMinutes(10))
                .build();
        HttpResponse<InputStream> resp = http.send(req, HttpResponse.BodyHandlers.ofInputStream());
        if (resp.statusCode() >= 400) {
            throw new RuntimeException("下载阿里云结果视频失败 HTTP " + resp.statusCode());
        }
        Files.createDirectories(dest.getParent());
        try (InputStream in = resp.body()) {
            Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
        }
        log.info("[AliyunErase] downloaded {} bytes to {}", Files.size(dest), dest);
    }

    /** 是否已配置 AccessKey（供 Controller 给前端展示状态）。 */
    public boolean isConfigured() {
        return accessKeyId != null && !accessKeyId.isBlank()
                && accessKeySecret != null && !accessKeySecret.isBlank();
    }

    public record PixelRegion(int x, int y, int w, int h) {}

    // ─── Aliyun RPC HMAC-SHA1 签名 ──────────────────────────────────────────

    private static String sign(Map<String, String> params, String secret) throws Exception {
        TreeMap<String, String> sorted = new TreeMap<>(params);
        sorted.remove("Signature");
        String canonical = buildQuery(sorted);
        String stringToSign = "GET&" + pctEncode("/") + "&" + pctEncode(canonical);
        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec((secret + "&").getBytes(StandardCharsets.UTF_8), "HmacSHA1"));
        byte[] sig = mac.doFinal(stringToSign.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(sig);
    }

    private static String buildQuery(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> e : new TreeMap<>(params).entrySet()) {
            if (!sb.isEmpty()) sb.append("&");
            sb.append(pctEncode(e.getKey())).append("=").append(pctEncode(e.getValue()));
        }
        return sb.toString();
    }

    private static String pctEncode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8)
                .replace("+", "%20")
                .replace("*", "%2A")
                .replace("%7E", "~");
    }

    private static boolean isOk(String code) {
        return code.isBlank() || "200".equals(code) || "Success".equalsIgnoreCase(code);
    }
}
