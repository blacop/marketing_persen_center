package com.beukay.marketing.person.domain.composition.ability;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.composition.model.SourceVideo;

import java.util.List;

public interface SourceVideoService {

    SourceVideo create(SourceVideo entity);

    SourceVideo getById(Long id);

    PageInfo<SourceVideo> page(String status, String name, PageQuery pageQuery);

    SourceVideo updateSegments(Long id, List<SourceVideo.Segment> segments);

    void updateStatus(Long id, String status);

    void updateProbe(Long id, Long durationMs, Integer width, Integer height);

    void delete(Long id);
}
