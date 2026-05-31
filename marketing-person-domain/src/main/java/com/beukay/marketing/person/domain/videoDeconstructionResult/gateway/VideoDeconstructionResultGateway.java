package com.beukay.marketing.person.domain.videoDeconstructionResult.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResultListCriteriaQuery;

import java.util.List;

public interface VideoDeconstructionResultGateway {

    Long create(VideoDeconstructionResult result);

    void update(VideoDeconstructionResult result);

    VideoDeconstructionResult queryById(Long id);

    VideoDeconstructionResult queryByRecordId(Long recordId);

    VideoDeconstructionResult queryByVideoId(String videoId);

    List<VideoDeconstructionResult> listBySkuId(String skuId);

    PageInfo<VideoDeconstructionResult> listPage(VideoDeconstructionResultListCriteriaQuery criteriaQuery, PageQuery pageQuery);
}
