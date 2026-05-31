package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.ContentStructureCardDO;
import com.beukay.marketing.person.domain.contentStructureCard.model.ContentStructureCard;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface ContentStructureCardConvertor extends BaseConvertor<ContentStructureCard, ContentStructureCardDO> {

    ContentStructureCardConvertor INSTANCE = Mappers.getMapper(ContentStructureCardConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "cardId", source = "cardId")
    @Mapping(target = "cardVersion", source = "cardVersion")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "hookType", source = "hookType")
    @Mapping(target = "targetAudience", source = "targetAudience")
    @Mapping(target = "marketingNode", source = "marketingNode")
    @Mapping(target = "accountId", source = "accountId")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "cardJson", source = "cardJson")
    @Mapping(target = "openingHook", source = "openingHook")
    @Mapping(target = "videoDurationSec", source = "videoDurationSec")
    @Mapping(target = "referenceVideoId", source = "referenceVideoId")
    @Mapping(target = "patternRankTop1", source = "patternRankTop1")
    @Mapping(target = "experimentKey", source = "experimentKey")
    @Mapping(target = "actualLiveGmv", source = "actualLiveGmv")
    @Mapping(target = "actualCompletion", source = "actualCompletion")
    @Mapping(target = "actualLiveTraffic", source = "actualLiveTraffic")
    @Mapping(target = "feedbackWrittenAt", source = "feedbackWrittenAt")
    @Mapping(target = "agentTraceId", source = "agentTraceId")
    @Mapping(target = "agentDefinitionId", source = "agentDefinitionId")
    @Mapping(target = "logicTrace", source = "logicTrace")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    ContentStructureCardDO to(ContentStructureCard source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "cardId", source = "cardId")
    @Mapping(target = "cardVersion", source = "cardVersion")
    @Mapping(target = "skuId", source = "skuId")
    @Mapping(target = "hookType", source = "hookType")
    @Mapping(target = "targetAudience", source = "targetAudience")
    @Mapping(target = "marketingNode", source = "marketingNode")
    @Mapping(target = "accountId", source = "accountId")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "cardJson", source = "cardJson")
    @Mapping(target = "openingHook", source = "openingHook")
    @Mapping(target = "videoDurationSec", source = "videoDurationSec")
    @Mapping(target = "referenceVideoId", source = "referenceVideoId")
    @Mapping(target = "patternRankTop1", source = "patternRankTop1")
    @Mapping(target = "experimentKey", source = "experimentKey")
    @Mapping(target = "actualLiveGmv", source = "actualLiveGmv")
    @Mapping(target = "actualCompletion", source = "actualCompletion")
    @Mapping(target = "actualLiveTraffic", source = "actualLiveTraffic")
    @Mapping(target = "feedbackWrittenAt", source = "feedbackWrittenAt")
    @Mapping(target = "agentTraceId", source = "agentTraceId")
    @Mapping(target = "agentDefinitionId", source = "agentDefinitionId")
    @Mapping(target = "logicTrace", source = "logicTrace")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "operator", ignore = true)
    ContentStructureCard from(ContentStructureCardDO source);
}
