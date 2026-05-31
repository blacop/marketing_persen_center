package com.beukay.marketing.person.infrastructure.convertor;

import com.beukay.ai.common.convertor.BaseConvertor;
import com.beukay.ai.common.convertor.BooleanStrategy;
import com.beukay.marketing.person.dbsdk.model.VideoAssemblyTaskDO;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyTask;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = BooleanStrategy.class)
public interface VideoAssemblyTaskConvertor extends BaseConvertor<VideoAssemblyTask, VideoAssemblyTaskDO> {
    VideoAssemblyTaskConvertor INSTANCE = Mappers.getMapper(VideoAssemblyTaskConvertor.class);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "taskCode", source = "taskCode")
    @Mapping(target = "blueprintCode", source = "blueprintCode")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "platform", source = "platform")
    @Mapping(target = "targetDuration", source = "targetDuration")
    @Mapping(target = "resultVideoUrl", source = "resultVideoUrl")
    @Mapping(target = "interventionStatus", source = "interventionStatus")
    @Mapping(target = "summaryJson", source = "summaryJson")
    @Mapping(target = "nezhaTenantCode", source = "baseFields.nezhaTenantCode")
    @Mapping(target = "createAt", source = "baseFields.createAt")
    @Mapping(target = "createBy", source = "baseFields.createBy")
    @Mapping(target = "createName", source = "baseFields.createName")
    @Mapping(target = "updateAt", source = "baseFields.updateAt")
    @Mapping(target = "updateBy", source = "baseFields.updateBy")
    @Mapping(target = "updateName", source = "baseFields.updateName")
    @Mapping(target = "isDeleted", source = "baseFields.isDeleted")
    VideoAssemblyTaskDO to(VideoAssemblyTask source);

    @Override
    @Mapping(target = "id", source = "id")
    @Mapping(target = "taskCode", source = "taskCode")
    @Mapping(target = "blueprintCode", source = "blueprintCode")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "platform", source = "platform")
    @Mapping(target = "targetDuration", source = "targetDuration")
    @Mapping(target = "resultVideoUrl", source = "resultVideoUrl")
    @Mapping(target = "interventionStatus", source = "interventionStatus")
    @Mapping(target = "summaryJson", source = "summaryJson")
    @Mapping(target = "baseFields.nezhaTenantCode", source = "nezhaTenantCode")
    @Mapping(target = "baseFields.createAt", source = "createAt")
    @Mapping(target = "baseFields.createBy", source = "createBy")
    @Mapping(target = "baseFields.createName", source = "createName")
    @Mapping(target = "baseFields.updateAt", source = "updateAt")
    @Mapping(target = "baseFields.updateBy", source = "updateBy")
    @Mapping(target = "baseFields.updateName", source = "updateName")
    @Mapping(target = "baseFields.isDeleted", source = "isDeleted")
    @Mapping(target = "operator", ignore = true)
    VideoAssemblyTask from(VideoAssemblyTaskDO source);
}
