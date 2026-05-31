package com.beukay.marketing.person.app.cutmatrix.script;

import com.beukay.marketing.person.app.cutmatrix.llm.LlmAdapter;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 电商详情页抽取：URL → 产品信息（品牌、产品名、卖点）
 *
 * 简化版：HTTP GET HTML → 抽 title/meta/body 文本 → LLM 总结。
 * 反爬强的站点（抖店/淘宝小程序）会返 404 / 风控页，此时 LLM 做空总结即可。
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class ProductInfoExtractor {

    private final LlmAdapter llm;

    private static final String UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
    private static final int MAX_HTML_CHARS = 8000;
    private static final int MAX_PRODUCT_TEXT = 2500;

    private final HttpClient http = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * 抓 URL → 抽产品信息描述（300-500 字）。
     * 返回结构化文本，可直接喂给后续 prompt。
     */
    public String extract(String url) {
        if (url == null || url.isBlank()) return "";
        String html;
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(20))
                    .header("User-Agent", UA)
                    .header("Accept", "text/html,application/xhtml+xml,*/*;q=0.9")
                    .header("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")
                    .GET()
                    .build();
            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() / 100 != 2) {
                log.warn("[ProductExtract] {} HTTP {}", url, resp.statusCode());
                return "（无法抓取页面 HTTP " + resp.statusCode() + "，URL: " + url + ")";
            }
            html = resp.body();
        } catch (Exception e) {
            log.warn("[ProductExtract] fetch {} failed: {}", url, e.getMessage());
            return "（抓取失败：" + e.getMessage() + "，URL: " + url + ")";
        }

        // 粗提取：title / meta description / og:* / 主要文本
        String compact = compactHtml(html);
        if (compact.length() > MAX_HTML_CHARS) compact = compact.substring(0, MAX_HTML_CHARS);

        // LLM 总结产品信息
        try {
            String sys = "你是产品信息提取助手，擅长从电商详情页 HTML 抽取关键产品信息。";
            String user = """
                    以下是从电商详情页抓取的 HTML 文本（已做简单去标签处理）。
                    请提取以下产品信息，用纯文本输出（不要 markdown，不要 JSON）：

                    1. 品牌名（如能识别）
                    2. 产品名 / 系列名
                    3. 核心卖点（3-5 条）
                    4. 适用场景 / 目标人群
                    5. 关键参数（颜色、规格、价格等可选）

                    要求：
                    - 严格基于 HTML 内容，不要瞎编
                    - 整体 300-500 字
                    - 信息密集，不要寒暄
                    - 如果 HTML 是错误页或风控页，输出"无法识别产品信息"

                    HTML 文本：
                    %s
                    """.formatted(compact);

            String summary = llm.chat(sys, user, LlmAdapter.ChatOptions.builder()
                    .temperature(0.3).maxTokens(700).build());
            if (summary.length() > MAX_PRODUCT_TEXT) summary = summary.substring(0, MAX_PRODUCT_TEXT);
            log.info("[ProductExtract] {} → {} chars summary", url, summary.length());
            return summary.trim();
        } catch (Exception e) {
            log.warn("[ProductExtract] LLM summarize failed: {}", e.getMessage());
            return "（LLM 总结失败：" + e.getMessage() + "）原始 HTML 片段：\n" +
                    compact.substring(0, Math.min(compact.length(), 500));
        }
    }

    /** 去掉 script/style/标签，压缩空白。极简版（不引入 jsoup）。 */
    private static String compactHtml(String html) {
        if (html == null) return "";
        // 1. 抽 title / meta / og 信息（拼到开头便于 LLM 读到）
        StringBuilder head = new StringBuilder();
        Matcher tm = Pattern.compile("<title[^>]*>([^<]+)</title>", Pattern.CASE_INSENSITIVE).matcher(html);
        if (tm.find()) head.append("[标题] ").append(tm.group(1).trim()).append('\n');

        Matcher mm = Pattern.compile("<meta[^>]+name=[\"']?(description|keywords)[\"']?[^>]+content=[\"']([^\"']+)[\"']",
                Pattern.CASE_INSENSITIVE).matcher(html);
        while (mm.find()) head.append("[meta-").append(mm.group(1)).append("] ").append(mm.group(2).trim()).append('\n');

        Matcher om = Pattern.compile("<meta[^>]+property=[\"']?og:([^\"'\\s]+)[\"']?[^>]+content=[\"']([^\"']+)[\"']",
                Pattern.CASE_INSENSITIVE).matcher(html);
        while (om.find()) head.append("[og-").append(om.group(1)).append("] ").append(om.group(2).trim()).append('\n');

        // 2. 去 script / style
        String body = html.replaceAll("(?is)<script[^>]*>.*?</script>", " ")
                          .replaceAll("(?is)<style[^>]*>.*?</style>", " ")
                          .replaceAll("(?is)<noscript[^>]*>.*?</noscript>", " ");
        // 3. 去标签
        body = body.replaceAll("(?s)<[^>]+>", " ");
        // 4. 去 HTML 实体常见
        body = body.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"");
        // 5. 压缩空白
        body = body.replaceAll("\\s+", " ").trim();

        return head + "\n[正文]\n" + body;
    }
}
