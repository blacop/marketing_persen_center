package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.VideoPerformanceRecordDO;
import com.beukay.marketing.person.domain.videoPerformanceRecord.model.VideoPerformanceRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface VideoPerformanceRecordConvertor extends BaseConvertor<VideoPerformanceRecord, VideoPerformanceRecordDO> {

    VideoPerformanceRecordConvertor INSTANCE = Mappers.getMapper(VideoPerformanceRecordConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "videoId", source = "videoId")
    @Mapping(target = "accountId", source = "accountId")
    @Mapping(target = "accountName", source = "accountName")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "publishTime", source = "publishTime")
    @Mapping(target = "videoUrl", source = "videoUrl")
    @Mapping(target = "isPromoted", source = "isPromoted")
    @Mapping(target = "views", source = "views")
    @Mapping(target = "likes", source = "likes")
    @Mapping(target = "comments", source = "comments")
    @Mapping(target = "saves", source = "saves")
    @Mapping(target = "shares", source = "shares")
    @Mapping(target = "follows", source = "follows")
    @Mapping(target = "completionRate", source = "completionRate")
    @Mapping(target = "avgWatchSec", source = "avgWatchSec")
    @Mapping(target = "liveGmv", source = "liveGmv")
    @Mapping(target = "liveTraffic", source = "liveTraffic")
    @Mapping(target = "liveOrders", source = "liveOrders")
    @Mapping(target = "postSearchGmv", source = "postSearchGmv")
    @Mapping(target = "skuTag", source = "skuTag")
    @Mapping(target = "hookType", source = "hookType")
    @Mapping(target = "contentPattern", source = "contentPattern")
    @Mapping(target = "compositeScore", source = "compositeScore")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    VideoPerformanceRecordDO to(VideoPerformanceRecord source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "videoId", source = "videoId")
    @Mapping(target = "accountId", source = "accountId")
    @Mapping(target = "accountName", source = "accountName")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "publishTime", source = "publishTime")
    @Mapping(target = "videoUrl", source = "videoUrl")
    @Mapping(target = "isPromoted", source = "isPromoted")
    @Mapping(target = "views", source = "views")
    @Mapping(target = "likes", source = "likes")
    @Mapping(target = "comments", source = "comments")
    @Mapping(target = "saves", source = "saves")
    @Mapping(target = "shares", source = "shares")
    @Mapping(target = "follows", source = "follows")
    @Mapping(target = "completionRate", source = "completionRate")
    @Mapping(target = "avgWatchSec", source = "avgWatchSec")
    @Mapping(target = "liveGmv", source = "liveGmv")
    @Mapping(target = "liveTraffic", source = "liveTraffic")
    @Mapping(target = "liveOrders", source = "liveOrders")
    @Mapping(target = "postSearchGmv", source = "postSearchGmv")
    @Mapping(target = "skuTag", source = "skuTag")
    @Mapping(target = "hookType", source = "hookType")
    @Mapping(target = "contentPattern", source = "contentPattern")
    @Mapping(target = "compositeScore", source = "compositeScore")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "operator", ignore = true)
    VideoPerformanceRecord from(VideoPerformanceRecordDO source);
}
