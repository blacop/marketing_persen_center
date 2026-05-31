package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.VideoDeconstructionDTO;
import com.beukay.marketing.person.client.dto.VideoPatternCandidateDTO;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.Map;

@Mapper
public interface VideoDeconstructionDTOConvertor {

    VideoDeconstructionDTOConvertor INSTANCE = Mappers.getMapper(VideoDeconstructionDTOConvertor.class);
    ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    default VideoDeconstructionDTO convert(VideoDeconstructionResult source) {
        return VideoDeconstructionDTO.builder()
                .id(source.getId())
                .recordId(source.getRecordId())
                .videoId(source.getVideoId())
                .skuId(source.getSkuId())
                .skuTag(source.getSkuTag())
                .hookType(source.getHookType())
                .titlePattern(source.getTitlePattern())
                .sceneTags(source.getSceneTags())
                .sellingPointTags(source.getSellingPointTags())
                .ctaTags(source.getCtaTags())
                .emotionTags(source.getEmotionTags())
                .targetAudienceTags(source.getTargetAudienceTags())
                .recommendedPatternCode(source.getRecommendedPatternCode())
                .recommendedPatternName(source.getRecommendedPatternName())
                .recommendedPatternReason(source.getRecommendedPatternReason())
                .patternDecisionJson(source.getPatternDecisionJson())
                .deconstructionJson(source.getDeconstructionJson())
                .actualPerformanceScore(source.getActualPerformanceScore())
                .verificationStatus(source.getVerificationStatus())
                .status(source.getStatus())
                .createAt(source.getBaseFields() != null ? source.getBaseFields().getCreateAt() : null)
                .createName(source.getBaseFields() != null ? source.getBaseFields().getCreateName() : null)
                .patternCandidates(parsePatternCandidates(source.getPatternDecisionJson()))
                .build();
    }

    private List<VideoPatternCandidateDTO> parsePatternCandidates(String patternDecisionJson) {
        if (patternDecisionJson == null || patternDecisionJson.isBlank()) {
            return List.of();
        }
        try {
            Map<String, Object> json = OBJECT_MAPPER.readValue(patternDecisionJson, new TypeReference<>() { });
            Object rawCandidates = json.get("candidates");
            if (!(rawCandidates instanceof List<?> candidates)) {
                return List.of();
            }
            return candidates.stream()
                    .filter(Map.class::isInstance)
                    .map(Map.class::cast)
                    .map(VideoPatternCandidateDTOConvertor.INSTANCE::convert)
                    .toList();
        } catch (Exception ex) {
            return List.of();
        }
    }
}
