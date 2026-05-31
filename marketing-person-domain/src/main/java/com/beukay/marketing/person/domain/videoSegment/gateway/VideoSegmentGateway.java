package com.beukay.marketing.person.domain.videoSegment.gateway;

import com.beukay.marketing.person.domain.videoSegment.model.VideoSegment;

import java.util.List;

/**
 * 视频最小单元 Gateway 接口
 */
public interface VideoSegmentGateway {

    /**
     * 批量创建视频片段
     */
    void batchCreate(List<VideoSegment> segments);

    /**
     * 根据任务ID查询所有片段
     */
    List<VideoSegment> listByTaskId(String taskId);

    /**
     * 根据视频ID查询所有片段
     */
    List<VideoSegment> listByVideoId(String videoId);

    /**
     * 根据SKU查询所有片段
     */
    List<VideoSegment> listBySkuId(String skuId);
}
