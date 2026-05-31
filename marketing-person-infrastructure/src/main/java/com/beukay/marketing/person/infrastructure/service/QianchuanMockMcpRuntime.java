package com.beukay.marketing.person.infrastructure.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 本地 mock MCP runtime。
 * 目标是先跑通 Agent -> MCP -> mock API -> Agent reply 的完整链路。
 */
@Component
@RequiredArgsConstructor
public class QianchuanMockMcpRuntime {

    private static final Pattern VIDEO_ID_PATTERN = Pattern.compile("video[_-]?id\\s*[=:：]\\s*([A-Za-z0-9_-]+)", Pattern.CASE_INSENSITIVE);
    private static final Pattern BUDGET_PATTERN = Pattern.compile("(?:预算|budget)\\s*[=:：]?\\s*(\\d+(?:\\.\\d+)?)", Pattern.CASE_INSENSITIVE);
    private static final Pattern ROI_PATTERN = Pattern.compile("(?:ROI|roi)\\s*[=:：]?\\s*(\\d+(?:\\.\\d+)?)");
    private static final Pattern DATE_RANGE_PATTERN = Pattern.compile("(\\d{4}-\\d{2}-\\d{2}).*?(\\d{4}-\\d{2}-\\d{2})");

    private final QianchuanMockApiClient apiClient;

    public String execute(String agentUniqueId, String userMessage, QianchuanMcpContext context) {
        if (QianchuanMcpInvoker.DELIVERY_AGENT_ID.equals(agentUniqueId)) {
            return executeDelivery(userMessage, context);
        }
        if (QianchuanMcpInvoker.DATA_AGENT_ID.equals(agentUniqueId)) {
            return executeData(userMessage, context);
        }
        throw new IllegalArgumentException("不支持的千川 Agent: " + agentUniqueId);
    }

    private String executeDelivery(String userMessage, QianchuanMcpContext context) {
        String advertiserId = context.advertiserIdOrMock();
        String videoId = extract(VIDEO_ID_PATTERN, userMessage, "MOCK_VIDEO_INPUT");
        BigDecimal budget = extractDecimal(BUDGET_PATTERN, userMessage, BigDecimal.valueOf(500));
        BigDecimal roiGoal = extractDecimal(ROI_PATTERN, userMessage, BigDecimal.valueOf(1.8));

        List<Map<String, Object>> awemes = apiClient.listAuthorizedAwemes(advertiserId);
        List<Map<String, Object>> products = apiClient.listAvailableProducts(advertiserId);
        Map<String, Object> uploadedVideo = apiClient.uploadVideo(videoId);
        Map<String, Object> suggestedBudget = apiClient.suggestBudget(budget);
        Map<String, Object> suggestedBid = apiClient.suggestBid();
        Map<String, Object> campaign = apiClient.createCampaign(advertiserId);
        Map<String, Object> estimate = apiClient.estimateEffect(budget, roiGoal);
        Map<String, Object> ad = apiClient.createAd(
                String.valueOf(uploadedVideo.get("videoId")),
                String.valueOf(products.get(0).get("productId")),
                String.valueOf(awemes.get(0).get("awemeId"))
        );
        Map<String, Object> adStatus = apiClient.getAd(String.valueOf(ad.get("adId")));

        return """
                千川投放 mock 流程已跑通。

                调用链路：
                1. qianchuan_aweme_authorized_get_v1：获取到 %d 个可投抖音号
                2. qianchuan_product_available_get_v1：获取到 %d 个可投商品
                3. file_video_ad_v2：视频素材 %s 可用
                4. qianchuan_suggest_budget_v1：建议日预算 %s
                5. qianchuan_suggest_bid_v1：建议出价 %s
                6. qianchuan_campaign_create_v1：创建广告组 %s
                7. qianchuan_estimate_effect_v1：预估 ROI %s，预估 GMV %s
                8. qianchuan_ad_create_v1：创建计划 %s
                9. qianchuan_ad_get_v1：当前状态 %s

                当前使用 mock MCP：server=%s，baseUrl=%s，advertiserId=%s。
                """.formatted(
                awemes.size(),
                products.size(),
                uploadedVideo.get("videoId"),
                suggestedBudget.get("dailyBudget"),
                suggestedBid.get("bid"),
                campaign.get("campaignId"),
                estimate.get("estimatedRoi"),
                estimate.get("estimatedGmv"),
                ad.get("adId"),
                adStatus.get("status"),
                context.serverName(),
                context.baseUrl(),
                advertiserId
        ).trim();
    }

    private String executeData(String userMessage, QianchuanMcpContext context) {
        String advertiserId = context.advertiserIdOrMock();
        String[] range = extractDateRange(userMessage);
        Map<String, Object> advertiserReport = apiClient.advertiserReport(advertiserId, range[0], range[1]);
        List<Map<String, Object>> adReport = apiClient.adReport();
        List<Map<String, Object>> materialReport = apiClient.materialReport();
        List<Map<String, Object>> lowQualityAds = apiClient.lowQualityAds();

        String topAds = adReport.stream()
                .map(item -> "%s ROI=%s CTR=%s".formatted(item.get("name"), item.get("roi"), item.get("ctr")))
                .collect(Collectors.joining("；"));
        String materialSummary = materialReport.stream()
                .map(item -> "%s ROI=%s 完播率=%s".formatted(item.get("label"), item.get("roi"), item.get("completeRate")))
                .collect(Collectors.joining("；"));

        return """
                千川数据 mock 流程已跑通。

                调用链路：
                1. qianchuan_report_advertiser_get_v1：账户 ROI=%s，消耗=%s，GMV=%s，CTR=%s
                2. qianchuan_report_ad_get_v1：计划表现：%s
                3. qianchuan_report_material_get_v1：素材表现：%s
                4. qianchuan_lq_ad_get_v1：发现 %d 个低效计划

                初步结论：
                - ROI 最高的是技术卖点型素材，可作为下一轮放量候选。
                - 低效计划主要问题是 ROI 和 CTR 同时低于 mock 基准，建议替换为技术证明型素材并收紧人群。

                当前使用 mock MCP：server=%s，baseUrl=%s，advertiserId=%s，dateRange=%s ~ %s。
                """.formatted(
                advertiserReport.get("roi"),
                advertiserReport.get("cost"),
                advertiserReport.get("gmv"),
                advertiserReport.get("ctr"),
                topAds,
                materialSummary,
                lowQualityAds.size(),
                context.serverName(),
                context.baseUrl(),
                advertiserId,
                range[0],
                range[1]
        ).trim();
    }

    private String extract(Pattern pattern, String value, String fallback) {
        if (value == null) {
            return fallback;
        }
        Matcher matcher = pattern.matcher(value);
        return matcher.find() ? matcher.group(1) : fallback;
    }

    private BigDecimal extractDecimal(Pattern pattern, String value, BigDecimal fallback) {
        String extracted = extract(pattern, value, null);
        return extracted == null ? fallback : new BigDecimal(extracted);
    }

    private String[] extractDateRange(String userMessage) {
        if (userMessage != null) {
            Matcher matcher = DATE_RANGE_PATTERN.matcher(userMessage);
            if (matcher.find()) {
                return new String[]{matcher.group(1), matcher.group(2)};
            }
        }
        return new String[]{"2026-04-01", "2026-04-07"};
    }

    public record QianchuanMcpContext(String serverName, String baseUrl, String advertiserId, boolean hasToken) {
        String advertiserIdOrMock() {
            return advertiserId == null || advertiserId.isBlank() ? "MOCK_ADVERTISER_001" : advertiserId;
        }
    }
}
