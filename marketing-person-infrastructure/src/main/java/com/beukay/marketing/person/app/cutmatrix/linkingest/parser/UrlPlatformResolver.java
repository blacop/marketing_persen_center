package com.beukay.marketing.person.app.cutmatrix.linkingest.parser;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * URL 平台分发器：识别链接来源，调对应解析器返回 ParsedMedia。
 * 当前内置：抖音 + 直链。其他平台后续按相同接口扩展。
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class UrlPlatformResolver {

    private static final String UA_DESKTOP = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
    private static final String UA_MOBILE  = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";

    private static final Pattern P_DIRECT_MEDIA = Pattern.compile("(?i)\\.(mp4|mov|m4v|webm|mkv|mp3|wav|m4a|jpg|jpeg|png|gif)([?&].*)?$");

    private final HttpClient http = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public ParsedMedia parse(String rawUrl) {
        String url = rawUrl.trim();
        try {
            if (url.contains("v.douyin.com") || url.contains("douyin.com") || url.contains("iesdouyin.com")) {
                return parseDouyin(url);
            }
            // TODO: bilibili / xhs / kuaishou
            if (P_DIRECT_MEDIA.matcher(url).find()) {
                return parseDirect(url);
            }
            // 未识别平台 → 兜底当直链尝试
            return ParsedMedia.builder()
                    .platform("unknown")
                    .sourceUrl(url)
                    .mediaUrl(url)
                    .title(guessTitleFromUrl(url))
                    .mediaType("video")
                    .build();
        } catch (Exception e) {
            log.error("[UrlResolver] parse failed: {}", url, e);
            throw new IllegalArgumentException("链接解析失败: " + e.getMessage(), e);
        }
    }

    // ─── 直链 ────────────────────────────────────────────────────────────

    private ParsedMedia parseDirect(String url) {
        String type = "video";
        if (url.matches("(?i).*\\.(mp3|wav|m4a)([?&].*)?$")) type = "audio";
        else if (url.matches("(?i).*\\.(jpg|jpeg|png|gif)([?&].*)?$")) type = "image";
        return ParsedMedia.builder()
                .platform("direct")
                .sourceUrl(url)
                .mediaUrl(url)
                .title(guessTitleFromUrl(url))
                .mediaType(type)
                .build();
    }

    // ─── 抖音 ────────────────────────────────────────────────────────────

    /**
     * 抖音解析步骤：
     *   1. 短链 v.douyin.com/<id> → 跟随 302 拿长链 → 提取 aweme_id
     *   2. 调 iesdouyin item info JSON
     *   3. 取 video.play_addr.url_list[0]，把 playwm 替换 play 拿无水印
     */
    private ParsedMedia parseDouyin(String url) throws Exception {
        // 步骤 1：跟随短链
        String longUrl = followRedirects(url, UA_MOBILE);
        Matcher idM = Pattern.compile("(?:video|note)/(\\d+)|/share/video/(\\d+)|aweme_id=(\\d+)|item_ids=(\\d+)")
                .matcher(longUrl);
        String awemeId = null;
        if (idM.find()) {
            for (int i = 1; i <= idM.groupCount(); i++) {
                if (idM.group(i) != null) { awemeId = idM.group(i); break; }
            }
        }
        if (awemeId == null) {
            throw new IllegalArgumentException("未在长链中提取到 aweme_id: " + longUrl);
        }

        // 步骤 2：调 item info（注意：抖音风控会变化；此为开发期实现）
        String apiUrl = "https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=" + awemeId;
        String json = httpGet(apiUrl, UA_MOBILE, null);

        // 步骤 3：粗暴 regex 提 url_list 第一项
        Matcher urlM = Pattern.compile("\"url_list\"\\s*:\\s*\\[\\s*\"([^\"]+)\"")
                .matcher(json);
        if (!urlM.find()) {
            throw new IllegalArgumentException("抖音返回中未找到视频直链（可能风控/接口变更），原始响应前 200 字: "
                    + json.substring(0, Math.min(json.length(), 200)));
        }
        String mediaUrl = urlM.group(1).replace("\\u002F", "/").replace("playwm", "play");

        // 标题
        Matcher descM = Pattern.compile("\"desc\"\\s*:\\s*\"([^\"]*)\"").matcher(json);
        String title = descM.find() ? descM.group(1) : "douyin-" + awemeId;
        title = title.replace("\\u002F", "/").trim();
        if (title.isEmpty()) title = "douyin-" + awemeId;

        // 时长
        Double durSec = null;
        Matcher durM = Pattern.compile("\"duration\"\\s*:\\s*(\\d+)").matcher(json);
        if (durM.find()) {
            try { durSec = Long.parseLong(durM.group(1)) / 1000.0; } catch (NumberFormatException ignore) { /* */ }
        }

        return ParsedMedia.builder()
                .platform("douyin")
                .sourceUrl(url)
                .mediaUrl(mediaUrl)
                .title(title)
                .mediaType("video")
                .durationSec(durSec)
                .downloadHeaders(Map.of("User-Agent", UA_MOBILE, "Referer", "https://www.douyin.com/"))
                .build();
    }

    // ─── HTTP helpers ───────────────────────────────────────────────────

    private String followRedirects(String url, String ua) throws Exception {
        // HttpClient.Redirect.NORMAL 已自动跟随 302。直接 HEAD 取最终 URI。
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("User-Agent", ua)
                .method("HEAD", HttpRequest.BodyPublishers.noBody())
                .timeout(Duration.ofSeconds(10))
                .build();
        HttpResponse<Void> resp = http.send(req, HttpResponse.BodyHandlers.discarding());
        return resp.uri().toString();
    }

    private String httpGet(String url, String ua, String referer) throws Exception {
        HttpRequest.Builder b = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("User-Agent", ua)
                .header("Accept", "*/*")
                .timeout(Duration.ofSeconds(15));
        if (referer != null) b.header("Referer", referer);
        HttpResponse<String> resp = http.send(b.build(), HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() / 100 != 2) {
            throw new IllegalStateException("HTTP " + resp.statusCode() + " for " + url);
        }
        return resp.body();
    }

    private String guessTitleFromUrl(String url) {
        try {
            URI u = URI.create(url);
            String[] parts = u.getPath().split("/");
            for (int i = parts.length - 1; i >= 0; i--) {
                if (!parts[i].isBlank()) {
                    String name = parts[i];
                    int dot = name.lastIndexOf('.');
                    if (dot > 0) name = name.substring(0, dot);
                    return name;
                }
            }
            return u.getHost();
        } catch (Exception e) {
            return url.length() > 30 ? url.substring(0, 30) : url;
        }
    }
}
