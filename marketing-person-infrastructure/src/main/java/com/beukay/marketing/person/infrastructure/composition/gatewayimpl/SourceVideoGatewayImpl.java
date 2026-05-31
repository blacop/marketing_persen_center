package com.beukay.marketing.person.infrastructure.composition.gatewayimpl;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.dbsdk.composition.dao.SourceVideoDOMapper;
import com.beukay.marketing.person.dbsdk.composition.model.SourceVideoDO;
import com.beukay.marketing.person.domain.composition.gateway.SourceVideoGateway;
import com.beukay.marketing.person.domain.composition.model.SourceVideo;
import com.beukay.marketing.person.infrastructure.composition.convertor.SourceVideoConvertor;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Log4j2
public class SourceVideoGatewayImpl implements SourceVideoGateway {

    private static final TypeReference<List<SourceVideo.Segment>> SEG_LIST_TYPE = new TypeReference<>() {};

    private final SourceVideoDOMapper mapper;
    private final ObjectMapper objectMapper;

    @Override
    public SourceVideo create(SourceVideo entity) {
        if (entity.getBaseFields() == null) {
            entity.setBaseFields(CompositionBaseFieldsHelper.fallbackForInsert());
        }
        if (entity.getStatus() == null) {
            entity.setStatus("DRAFT");
        }
        SourceVideoDO data = SourceVideoConvertor.INSTANCE.to(entity);
        data.setSegmentsJson(serialize(entity.getSegments()));
        mapper.insert(data);
        entity.setId(data.getId());
        SourceVideo reloaded = findById(data.getId());
        if (reloaded != null) return reloaded;
        SourceVideo fallback = SourceVideoConvertor.INSTANCE.from(data);
        fallback.setSegments(deserialize(data.getSegmentsJson()));
        return fallback;
    }

    @Override
    public SourceVideo findById(Long id) {
        SourceVideoDO row = mapper.selectById(id);
        if (row == null) return null;
        SourceVideo v = SourceVideoConvertor.INSTANCE.from(row);
        v.setSegments(deserialize(row.getSegmentsJson()));
        return v;
    }

    @Override
    public PageInfo<SourceVideo> page(String status, String name, PageQuery pageQuery) {
        long pageIndex = pageQuery == null || pageQuery.getPageIndex() == null ? 1L : pageQuery.getPageIndex();
        long pageSize = pageQuery == null || pageQuery.getPageSize() == null ? 20L : pageQuery.getPageSize();
        long offset = (pageIndex - 1) * pageSize;
        long total = mapper.countPage(status, name);
        List<SourceVideoDO> rows = total == 0 ? List.of()
                : mapper.selectPage(status, name, offset, (int) pageSize);
        List<SourceVideo> records = new ArrayList<>(rows.size());
        for (SourceVideoDO r : rows) {
            SourceVideo v = SourceVideoConvertor.INSTANCE.from(r);
            v.setSegments(deserialize(r.getSegmentsJson()));
            records.add(v);
        }
        return PageInfo.<SourceVideo>builder()
                .pageIndex(pageIndex).pageSize(pageSize).total(total).records(records).build();
    }

    @Override
    public SourceVideo updateSegments(Long id, List<SourceVideo.Segment> segments) {
        mapper.updateSegments(id, serialize(segments));
        return findById(id);
    }

    @Override
    public void updateProbe(Long id, Long durationMs, Integer width, Integer height) {
        mapper.updateProbe(id, durationMs, width, height);
    }

    @Override
    public void updateStatus(Long id, String status) {
        mapper.updateStatus(id, status);
    }

    @Override
    public void softDelete(Long id) {
        mapper.softDelete(id);
    }

    private String serialize(List<SourceVideo.Segment> segments) {
        if (segments == null || segments.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(segments);
        } catch (JsonProcessingException e) {
            log.error("[source-video] serialize segments failed", e);
            return "[]";
        }
    }

    private List<SourceVideo.Segment> deserialize(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, SEG_LIST_TYPE);
        } catch (JsonProcessingException e) {
            log.warn("[source-video] deserialize segments failed: {}", json, e);
            return new ArrayList<>();
        }
    }
}
