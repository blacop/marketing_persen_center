package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.ContentPatternKnowledgeDO;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledge;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface ContentPatternKnowledgeConvertor extends BaseConvertor<ContentPatternKnowledge, ContentPatternKnowledgeDO> {

    ContentPatternKnowledgeConvertor INSTANCE = Mappers.getMapper(ContentPatternKnowledgeConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "knowledgeId", source = "knowledgeId")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "skuTag", source = "skuTag")
    @Mapping(target = "marketingNode", source = "marketingNode")
    @Mapping(target = "targetAudience", source = "targetAudience")
    @Mapping(target = "hookType", source = "hookType")
    @Mapping(target = "patternType", source = "patternType")
    @Mapping(target = "recommendedOpening", source = "recommendedOpening")
    @Mapping(target = "recommendedSellingPoints", source = "recommendedSellingPoints")
    @Mapping(target = "recommendedCta", source = "recommendedCta")
    @Mapping(target = "recommendedScenes", source = "recommendedScenes")
    @Mapping(target = "negativeRules", source = "negativeRules")
    @Mapping(target = "patternScore", source = "patternScore")
    @Mapping(target = "actualPerformanceScore", source = "actualPerformanceScore")
    @Mapping(target = "patternEmbedding", source = "patternEmbedding")
    @Mapping(target = "knowledgeJson", source = "knowledgeJson")
    @Mapping(target = "version", source = "version")
    @Mapping(target = "verificationStatus", source = "verificationStatus")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    ContentPatternKnowledgeDO to(ContentPatternKnowledge source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "knowledgeId", source = "knowledgeId")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "skuTag", source = "skuTag")
    @Mapping(target = "marketingNode", source = "marketingNode")
    @Mapping(target = "targetAudience", source = "targetAudience")
    @Mapping(target = "hookType", source = "hookType")
    @Mapping(target = "patternType", source = "patternType")
    @Mapping(target = "recommendedOpening", source = "recommendedOpening")
    @Mapping(target = "recommendedSellingPoints", source = "recommendedSellingPoints")
    @Mapping(target = "recommendedCta", source = "recommendedCta")
    @Mapping(target = "recommendedScenes", source = "recommendedScenes")
    @Mapping(target = "negativeRules", source = "negativeRules")
    @Mapping(target = "patternScore", source = "patternScore")
    @Mapping(target = "actualPerformanceScore", source = "actualPerformanceScore")
    @Mapping(target = "patternEmbedding", source = "patternEmbedding")
    @Mapping(target = "knowledgeJson", source = "knowledgeJson")
    @Mapping(target = "version", source = "version")
    @Mapping(target = "verificationStatus", source = "verificationStatus")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "operator", ignore = true)
    ContentPatternKnowledge from(ContentPatternKnowledgeDO source);
}
