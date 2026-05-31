package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.Operator;
import com.beukay.ai.common.exception.BadParameterException;
import com.beukay.marketing.person.domain.productTruth.gateway.ProductTruthGateway;
import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.domain.videoPatternCandidate.ability.VideoPatternCandidateDomainService;
import com.beukay.marketing.person.domain.videoPatternCandidate.model.VideoPatternCandidate;
import com.beukay.marketing.person.domain.videoDeconstructionResult.ability.VideoDeconstructionResultDomainService;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.beukay.marketing.person.domain.videoPerformanceRecord.gateway.VideoPerformanceRecordGateway;
import com.beukay.marketing.person.domain.videoPerformanceRecord.model.VideoPerformanceRecord;
import com.beukay.marketing.person.infrastructure.service.RuleBasedVideoDeconstructionEngine;
import com.beukay.marketing.person.infrastructure.service.SkuIdResolver;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.beukay.ai.common.exception.GenericBusinessException;
@Service
@RequiredArgsConstructor
public class VideoKnowledgeBuildAppService {

    private static final Operator SYSTEM_OPERATOR = new Operator(0L, "system");
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final VideoDeconstructionResultDomainService videoDeconstructionResultDomainService;
    private final ProductTruthGateway productTruthGateway;
    private final VideoPerformanceRecordGateway videoPerformanceRecordGateway;
    private final RuleBasedVideoDeconstructionEngine ruleBasedVideoDeconstructionEngine;
    private final SkuIdResolver skuIdResolver;
    private final VideoPatternCandidateDomainService videoPatternCandidateDomainService;

    @Transactional(rollbackFor = Exception.class)
    public VideoDeconstructionResult deconstruct(Long recordId, String skuId) {
        VideoDeconstructionResult existing = videoDeconstructionResultDomainService.queryByRecordId(recordId);
        if (existing != null) {
            return existing;
        }

        String resolvedSkuId = skuIdResolver.resolve(skuId);
        ProductTruth productTruth = productTruthGateway.queryBySkuId(resolvedSkuId);
        if (productTruth == null) {
            throw new BadParameterException(skuIdResolver.buildNotFoundMessage(skuId, resolvedSkuId));
        }
        VideoPerformanceRecord record = videoPerformanceRecordGateway.queryById(recordId);
        if (record == null) {
            throw new BadParameterException("VideoPerformanceRecord不存在: " + recordId);
        }

        RuleBasedVideoDeconstructionEngine.PatternAnalysis analysis = ruleBasedVideoDeconstructionEngine.analyze(record, productTruth);
        VideoDeconstructionResult result = analysis.result();
        result.buildInsert(SYSTEM_OPERATOR);
        Long id = videoDeconstructionResultDomainService.create(result);
        result.setId(id);
        persistPatternCandidates(id, record, analysis.decision());
        return result;
    }

    private void persistPatternCandidates(Long deconstructionResultId,
                                          VideoPerformanceRecord record,
                                          RuleBasedVideoDeconstructionEngine.PatternDecision decision) {
        List<VideoPatternCandidate> candidates = decision.candidates().stream()
                .map(candidate -> {
                    VideoPatternCandidate entity = VideoPatternCandidate.builder()
                            .deconstructionResultId(deconstructionResultId)
                            .recordId(record.getId())
                            .videoId(record.getVideoId())
                            .patternCode(candidate.patternCode())
                            .patternName(candidate.patternName())
                            .matchScore(candidate.score())
                            .reasonJson(writeJson(candidate.reasons()))
                            .rankNo(decision.candidates().indexOf(candidate) + 1)
                            .recommended(decision.recommended().patternCode().equals(candidate.patternCode()))
                            .build();
                    entity.buildInsert(SYSTEM_OPERATOR);
                    return entity;
                })
                .toList();
        videoPatternCandidateDomainService.batchCreate(candidates);
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new GenericBusinessException("候选模式JSON序列化失败" + ": " + e.getMessage());
        }
    }
}
