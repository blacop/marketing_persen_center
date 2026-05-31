package com.beukay.marketing.person.infrastructure.service;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

/**
 * 千川后置 API 的本地 mock 实现。
 * 后续接真实巨量千川时，用真实 HTTP client 替换本类即可。
 */
@Component
public class QianchuanMockApiClient {

    public List<Map<String, Object>> listAuthorizedAwemes(String advertiserId) {
        return List.of(
                Map.of("awemeId", "MOCK_AWEME_001", "name", "玛丽黛佳官方旗舰店", "permission", "短视频带货/直播带货"),
                Map.of("awemeId", "MOCK_AWEME_002", "name", "玛丽黛佳彩妆实验室", "permission", "短视频带货")
        );
    }

    public List<Map<String, Object>> listAvailableProducts(String advertiserId) {
        return List.of(
                Map.of("productId", "MOCK_PRODUCT_001", "name", "种子气垫", "category", "底妆/气垫"),
                Map.of("productId", "MOCK_PRODUCT_002", "name", "唇釉", "category", "唇部彩妆")
        );
    }

    public Map<String, Object> uploadVideo(String videoId) {
        String id = isBlank(videoId) ? "MOCK_VIDEO_" + System.currentTimeMillis() : videoId;
        return Map.of("videoId", id, "auditStatus", "AVAILABLE", "durationSeconds", 28);
    }

    public Map<String, Object> suggestBudget(BigDecimal requestedBudget) {
        BigDecimal budget = requestedBudget == null ? BigDecimal.valueOf(500) : requestedBudget;
        return Map.of("dailyBudget", budget, "minBudget", 300, "reason", "mock: 参考同品类冷启动预算");
    }

    public Map<String, Object> suggestBid() {
        return Map.of("bid", BigDecimal.valueOf(1.25), "unit", "CNY", "reason", "mock: 参考近 7 日点击成本");
    }

    public Map<String, Object> createCampaign(String advertiserId) {
        return Map.of(
                "campaignId", "MOCK_CAMPAIGN_" + safeSuffix(advertiserId),
                "marketingGoal", "LIVE_PROM_GOODS",
                "status", "ENABLE"
        );
    }

    public Map<String, Object> estimateEffect(BigDecimal budget, BigDecimal roiGoal) {
        BigDecimal normalizedBudget = budget == null ? BigDecimal.valueOf(500) : budget;
        BigDecimal normalizedRoi = roiGoal == null ? BigDecimal.valueOf(1.8) : roiGoal;
        BigDecimal estimatedGmv = normalizedBudget.multiply(normalizedRoi).setScale(2, RoundingMode.HALF_UP);
        return Map.of(
                "estimatedRoi", normalizedRoi,
                "estimatedGmv", estimatedGmv,
                "estimatedClicks", normalizedBudget.multiply(BigDecimal.valueOf(42)).intValue(),
                "confidence", "MOCK_HIGH"
        );
    }

    public Map<String, Object> createAd(String videoId, String productId, String awemeId) {
        return Map.of(
                "adId", "MOCK_AD_" + System.currentTimeMillis(),
                "videoId", isBlank(videoId) ? "MOCK_VIDEO_DEFAULT" : videoId,
                "productId", isBlank(productId) ? "MOCK_PRODUCT_001" : productId,
                "awemeId", isBlank(awemeId) ? "MOCK_AWEME_001" : awemeId,
                "status", "AUDITING"
        );
    }

    public Map<String, Object> getAd(String adId) {
        return Map.of("adId", adId, "status", "AUDITING", "rejectReason", "");
    }

    public Map<String, Object> advertiserReport(String advertiserId, String startDate, String endDate) {
        return Map.of(
                "advertiserId", advertiserId,
                "startDate", startDate,
                "endDate", endDate,
                "cost", BigDecimal.valueOf(12800),
                "gmv", BigDecimal.valueOf(28600),
                "roi", BigDecimal.valueOf(2.23),
                "ctr", BigDecimal.valueOf(0.036)
        );
    }

    public List<Map<String, Object>> adReport() {
        return List.of(
                Map.of("adId", "MOCK_AD_001", "name", "气垫技术卖点短视频", "cost", 4200, "roi", 2.85, "ctr", 0.044),
                Map.of("adId", "MOCK_AD_002", "name", "敏感肌场景种草短视频", "cost", 3600, "roi", 1.72, "ctr", 0.031),
                Map.of("adId", "MOCK_AD_003", "name", "直播间引流计划", "cost", 5000, "roi", 2.05, "ctr", 0.034)
        );
    }

    public List<Map<String, Object>> materialReport() {
        return List.of(
                Map.of("materialId", "MOCK_MATERIAL_001", "label", "技术证明", "roi", 2.91, "completeRate", 0.42),
                Map.of("materialId", "MOCK_MATERIAL_002", "label", "场景植入", "roi", 1.68, "completeRate", 0.31)
        );
    }

    public List<Map<String, Object>> lowQualityAds() {
        return List.of(
                Map.of("adId", "MOCK_AD_002", "reason", "ROI 低于 1.8 且 CTR 低于账户均值", "suggestion", "换用技术证明型素材")
        );
    }

    private String safeSuffix(String value) {
        if (isBlank(value)) {
            return "ADVERTISER";
        }
        return value.length() <= 6 ? value : value.substring(value.length() - 6);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
