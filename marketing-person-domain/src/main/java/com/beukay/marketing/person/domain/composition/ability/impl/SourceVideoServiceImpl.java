package com.beukay.marketing.person.domain.composition.ability.impl;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.composition.ability.SourceVideoService;
import com.beukay.marketing.person.domain.composition.gateway.SourceVideoGateway;
import com.beukay.marketing.person.domain.composition.model.SourceVideo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SourceVideoServiceImpl implements SourceVideoService {

    private final SourceVideoGateway gateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SourceVideo create(SourceVideo entity) {
        return gateway.create(entity);
    }

    @Override
    public SourceVideo getById(Long id) {
        return gateway.findById(id);
    }

    @Override
    public PageInfo<SourceVideo> page(String status, String name, PageQuery pageQuery) {
        return gateway.page(status, name, pageQuery);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SourceVideo updateSegments(Long id, List<SourceVideo.Segment> segments) {
        return gateway.updateSegments(id, segments);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, String status) {
        gateway.updateStatus(id, status);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateProbe(Long id, Long durationMs, Integer width, Integer height) {
        gateway.updateProbe(id, durationMs, width, height);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        gateway.softDelete(id);
    }
}
