package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.PatternReferenceVideoRelDO;
import com.beukay.marketing.person.domain.patternReferenceVideoRel.model.PatternReferenceVideoRel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface PatternReferenceVideoRelConvertor extends BaseConvertor<PatternReferenceVideoRel, PatternReferenceVideoRelDO> {

    PatternReferenceVideoRelConvertor INSTANCE = Mappers.getMapper(PatternReferenceVideoRelConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "knowledgeId", source = "knowledgeId")
    @Mapping(target = "videoId", source = "videoId")
    @Mapping(target = "recordId", source = "recordId")
    @Mapping(target = "relationType", source = "relationType")
    @Mapping(target = "referenceScore", source = "referenceScore")
    @Mapping(target = "actualPerformanceScore", source = "actualPerformanceScore")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    PatternReferenceVideoRelDO to(PatternReferenceVideoRel source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "knowledgeId", source = "knowledgeId")
    @Mapping(target = "videoId", source = "videoId")
    @Mapping(target = "recordId", source = "recordId")
    @Mapping(target = "relationType", source = "relationType")
    @Mapping(target = "referenceScore", source = "referenceScore")
    @Mapping(target = "actualPerformanceScore", source = "actualPerformanceScore")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "operator", ignore = true)
    PatternReferenceVideoRel from(PatternReferenceVideoRelDO source);
}
