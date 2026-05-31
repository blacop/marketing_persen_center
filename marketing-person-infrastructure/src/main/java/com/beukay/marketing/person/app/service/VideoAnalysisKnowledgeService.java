package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.Operator;
import com.beukay.marketing.person.domain.productTruth.gateway.ProductTruthGateway;
import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.domain.videoDeconstructionResult.ability.VideoDeconstructionResultDomainService;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.beukay.marketing.person.infrastructure.service.VideoUnderstandingAnalyzer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

import com.beukay.ai.common.exception.GenericBusinessException;
@Service
@RequiredArgsConstructor
@Log4j2
public class VideoAnalysisKnowledgeService {

    private static final Operator SYSTEM_OPERATOR = new Operator(0L, "system");
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final VideoDeconstructionResultDomainService videoDeconstructionResultDomainService;
    private final ContentPatternKnowledgeBuildAppService contentPatternKnowledgeBuildAppService;
    private final ProductTruthGateway productTruthGateway;

    /**
     * 将 AI 视频理解分析结果直接写入知识层，并异步触发模式知识聚合
     * 幂等：videoId 已存在则跳过
     */
    @Transactional(rollbackFor = Exception.class)
    public void persistFromAnalysis(String taskId, String skuId,
                                    VideoUnderstandingAnalyzer.VideoUnderstandingAnalysis analysis) {
        VideoDeconstructionResult existing = videoDeconstructionResultDomainService.queryByVideoId(taskId);
        if (existing != null) {
            log.info("[VideoAnalysisKnowledge] taskId={} 已存在拆解结果，跳过", taskId);
            return;
        }

        ProductTruth pt = productTruthGateway.queryBySkuId(skuId);
        String skuTag = (pt != null && pt.getProductName() != null && !pt.getProductName().isBlank())
                ? pt.getProductName() : skuId;

        VideoDeconstructionResult result = VideoDeconstructionResult.builder()
                .recordId(buildSyntheticRecordId(taskId))
                .videoId(taskId)
                .skuId(skuId)
                .skuTag(skuTag)
                .hookType(analysis.getHookType())
                .titlePattern(analysis.getTitlePattern())
                .sceneTags(writeJson(safe(analysis.getSceneTags())))
                .sellingPointTags(writeJson(safe(analysis.getSellingPointTags())))
                .ctaTags(writeJson(safe(analysis.getCtaTags())))
                .emotionTags(writeJson(safe(analysis.getEmotionTags())))
                .targetAudienceTags(writeJson(safe(analysis.getTargetAudienceTags())))
                .recommendedPatternCode("AI_ANALYZED")
                .recommendedPatternName("AI视频理解")
                .recommendedPatternReason(safe(analysis.getReasoning()))
                .deconstructionJson(writeJson(analysis))
                .version("ark-v1")
                .actualPerformanceScore(BigDecimal.ZERO)
                .verificationStatus("AI_PENDING")
                .status("ACTIVE")
                .build();
        result.buildInsert(SYSTEM_OPERATOR);
        videoDeconstructionResultDomainService.create(result);
        log.info("[VideoAnalysisKnowledge] taskId={} skuId={} 写入video_deconstruction_result成功", taskId, skuId);
    }

    @Async
    public void triggerPatternAggregationAsync(String skuId) {
        try {
            contentPatternKnowledgeBuildAppService.aggregateBySku(skuId, "日常种草", "全体");
            log.info("[VideoAnalysisKnowledge] skuId={} 模式知识聚合触发成功", skuId);
        } catch (Exception e) {
            log.warn("[VideoAnalysisKnowledge] skuId={} 模式知识聚合触发失败（非阻塞）: {}", skuId, e.getMessage());
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new GenericBusinessException("JSON序列化失败" + ": " + e.getMessage());
        }
    }

    private String safe(String s) { return s != null ? s : ""; }
    private List<String> safe(List<String> l) { return l != null ? l : List.of(); }

    private long buildSyntheticRecordId(String taskId) {
        UUID uuid = UUID.nameUUIDFromBytes(("video-understanding:" + safe(taskId)).getBytes(StandardCharsets.UTF_8));
        long positive = uuid.getLeastSignificantBits() & Long.MAX_VALUE;
        return -(positive == 0 ? 1 : positive);
    }
}
