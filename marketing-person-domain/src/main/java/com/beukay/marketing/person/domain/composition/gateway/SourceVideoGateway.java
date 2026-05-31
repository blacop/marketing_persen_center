package com.beukay.marketing.person.domain.composition.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.composition.model.SourceVideo;

import java.util.List;

public interface SourceVideoGateway {

    SourceVideo create(SourceVideo entity);

    SourceVideo findById(Long id);

    PageInfo<SourceVideo> page(String status, String name, PageQuery pageQuery);

    SourceVideo updateSegments(Long id, List<SourceVideo.Segment> segments);

    void updateProbe(Long id, Long durationMs, Integer width, Integer height);

    void updateStatus(Long id, String status);

    void softDelete(Long id);
}
