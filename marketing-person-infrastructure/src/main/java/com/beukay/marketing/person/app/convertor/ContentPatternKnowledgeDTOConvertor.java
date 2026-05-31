package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.ContentPatternKnowledgeDTO;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledge;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ContentPatternKnowledgeDTOConvertor {

    ContentPatternKnowledgeDTOConvertor INSTANCE = Mappers.getMapper(ContentPatternKnowledgeDTOConvertor.class);

    default ContentPatternKnowledgeDTO convert(ContentPatternKnowledge source) {
        return ContentPatternKnowledgeDTO.builder()
                .id(source.getId())
                .knowledgeId(source.getKnowledgeId())
                .skuId(source.getSkuId())
                .skuTag(source.getSkuTag())
                .marketingNode(source.getMarketingNode())
                .targetAudience(source.getTargetAudience())
                .hookType(source.getHookType())
                .patternType(source.getPatternType())
                .recommendedOpening(source.getRecommendedOpening())
                .recommendedSellingPoints(source.getRecommendedSellingPoints())
                .recommendedCta(source.getRecommendedCta())
                .recommendedScenes(source.getRecommendedScenes())
                .negativeRules(source.getNegativeRules())
                .patternScore(source.getPatternScore())
                .actualPerformanceScore(source.getActualPerformanceScore())
                .knowledgeJson(source.getKnowledgeJson())
                .verificationStatus(source.getVerificationStatus())
                .status(source.getStatus())
                .createAt(source.getBaseFields() != null ? source.getBaseFields().getCreateAt() : null)
                .createName(source.getBaseFields() != null ? source.getBaseFields().getCreateName() : null)
                .build();
    }
}
