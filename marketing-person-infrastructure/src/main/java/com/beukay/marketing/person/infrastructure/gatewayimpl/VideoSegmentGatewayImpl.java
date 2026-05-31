package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.beukay.marketing.person.dbsdk.dao.VideoSegmentDOMapper;
import com.beukay.marketing.person.dbsdk.model.VideoSegmentDO;
import com.beukay.marketing.person.domain.videoSegment.gateway.VideoSegmentGateway;
import com.beukay.marketing.person.domain.videoSegment.model.VideoSegment;
import com.beukay.marketing.person.infrastructure.convertor.VideoSegmentConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 视频最小单元 Gateway 实现
 */
@Component
@RequiredArgsConstructor
public class VideoSegmentGatewayImpl implements VideoSegmentGateway {

    private final VideoSegmentDOMapper mapper;

    @Override
    public void batchCreate(List<VideoSegment> segments) {
        if (CollectionUtils.isEmpty(segments)) {
            return;
        }
        for (VideoSegment segment : segments) {
            VideoSegmentDO doObj = VideoSegmentConvertor.INSTANCE.to(segment);
            mapper.insert(doObj);
        }
    }

    @Override
    public List<VideoSegment> listByTaskId(String taskId) {
        if (taskId == null || taskId.isBlank()) {
            return Collections.emptyList();
        }
        return mapper.selectList(new LambdaQueryWrapper<VideoSegmentDO>()
                        .eq(VideoSegmentDO::getTaskId, taskId)
                        .eq(VideoSegmentDO::getIsDeleted, 0)
                        .orderByAsc(VideoSegmentDO::getSegmentIndex))
                .stream()
                .map(VideoSegmentConvertor.INSTANCE::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoSegment> listByVideoId(String videoId) {
        if (videoId == null || videoId.isBlank()) {
            return Collections.emptyList();
        }
        return mapper.selectList(new LambdaQueryWrapper<VideoSegmentDO>()
                        .eq(VideoSegmentDO::getVideoId, videoId)
                        .eq(VideoSegmentDO::getIsDeleted, 0)
                        .orderByAsc(VideoSegmentDO::getSegmentIndex))
                .stream()
                .map(VideoSegmentConvertor.INSTANCE::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoSegment> listBySkuId(String skuId) {
        if (skuId == null || skuId.isBlank()) {
            return Collections.emptyList();
        }
        return mapper.selectList(new LambdaQueryWrapper<VideoSegmentDO>()
                        .eq(VideoSegmentDO::getSkuId, skuId)
                        .eq(VideoSegmentDO::getIsDeleted, 0)
                        .orderByAsc(VideoSegmentDO::getVideoId)
                        .orderByAsc(VideoSegmentDO::getSegmentIndex))
                .stream()
                .map(VideoSegmentConvertor.INSTANCE::from)
                .collect(Collectors.toList());
    }
}
