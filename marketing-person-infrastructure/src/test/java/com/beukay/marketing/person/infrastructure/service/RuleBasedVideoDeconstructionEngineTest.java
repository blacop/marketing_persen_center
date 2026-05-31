package com.beukay.marketing.person.infrastructure.service;

import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.beukay.marketing.person.domain.videoPerformanceRecord.model.VideoPerformanceRecord;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RuleBasedVideoDeconstructionEngineTest {

    @Test
    void shouldExtractHookSellingPointsAndCtaFromTitle() throws Exception {
        RuleBasedVideoDeconstructionEngine engine = new RuleBasedVideoDeconstructionEngine(new ObjectMapper());
        ProductTruth truth = ProductTruth.builder()
                .skuId("seed-cushion-2")
                .preferredScenes("[\"旅游\",\"早八\",\"约会\"]")
                .evidencePoints("[\"24小时持妆\",\"14小时控油\",\"微米级粉体薄如蝉翼\",\"遮瑕力强\"]")
                .targetSkinType("[\"干皮\",\"混干皮\"]")
                .promotionMechanisms("[\"直播间买1发13\",\"直播间限时福利\"]")
                .forbiddenClaims("[\"医疗级修复\"]")
                .build();
        VideoPerformanceRecord record = VideoPerformanceRecord.builder()
                .id(1001L)
                .videoId("dy-001")
                .title("国货彩妆顶流 x「24小时持妆+14小时控油」微米级粉体，长白山旅游也不怕，直播间抢先购！")
                .skuTag("种籽气垫2.0")
                .hookType("技术卖点型")
                .views(268690L)
                .avgWatchSec(3)
                .completionRate(new BigDecimal("2.52"))
                .liveGmv(new BigDecimal("54182.00"))
                .compositeScore(new BigDecimal("91.20"))
                .build();

        VideoDeconstructionResult result = engine.build(record, truth);

        assertEquals("技术卖点型", result.getHookType());
        assertEquals("TECHNICAL_PROOF", result.getTitlePattern());
        assertTrue(result.getSceneTags().contains("旅游"));
        assertTrue(result.getSellingPointTags().contains("24小时持妆"));
        assertTrue(result.getSellingPointTags().contains("14小时控油"));
        assertTrue(result.getCtaTags().contains("直播间"));
        assertTrue(result.getDeconstructionJson().contains("forbiddenClaims"));
        assertEquals(new BigDecimal("91.20"), result.getActualPerformanceScore());
        assertEquals("PENDING", result.getVerificationStatus());

        Map<String, Object> decision = new ObjectMapper().readValue(result.getDeconstructionJson(), new TypeReference<>() { });
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) decision.get("patternCandidates");
        assertTrue(candidates.size() >= 2);
        assertEquals("TECH_SELLING", decision.get("recommendedPatternCode"));
        assertEquals("技术卖点型", decision.get("recommendedPatternName"));
        assertTrue(String.valueOf(decision.get("recommendedPatternReason")).contains("24小时持妆"));
    }
}
