package com.beukay.marketing.person.infrastructure.composition.gatewayimpl;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.dbsdk.composition.dao.RenderJobDOMapper;
import com.beukay.marketing.person.dbsdk.composition.model.RenderJobDO;
import com.beukay.marketing.person.domain.composition.gateway.RenderJobGateway;
import com.beukay.marketing.person.domain.composition.model.RenderConfig;
import com.beukay.marketing.person.domain.composition.model.RenderJob;
import com.beukay.marketing.person.infrastructure.composition.convertor.RenderJobConvertor;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Log4j2
public class RenderJobGatewayImpl implements RenderJobGateway {

    private final RenderJobDOMapper mapper;
    private final ObjectMapper objectMapper;

    @Override
    public RenderJob save(RenderJob job) {
        if (job.getBaseFields() == null) {
            job.setBaseFields(CompositionBaseFieldsHelper.fallbackForInsert());
        }
        RenderJobDO data = RenderJobConvertor.INSTANCE.to(job);
        data.setRenderConfigJson(encodeConfig(job.getRenderConfig()));
        if (data.getId() == null) {
            mapper.insert(data);
        } else {
            mapper.update(data);
        }
        RenderJob reloaded = loadAndDecode(data.getId());
        if (reloaded != null) return reloaded;
        // 多租户拦截器导致重查为 null 时，回退到刚写入的 in-memory DO
        RenderJob fallback = RenderJobConvertor.INSTANCE.from(data);
        fallback.setRenderConfig(decodeConfig(data.getRenderConfigJson()));
        return fallback;
    }

    @Override
    public RenderJob findById(Long id) {
        return loadAndDecode(id);
    }

    @Override
    public PageInfo<RenderJob> page(Long projectId, String status, PageQuery pageQuery) {
        long pageIndex = pageQuery == null || pageQuery.getPageIndex() == null ? 1L : pageQuery.getPageIndex();
        long pageSize = pageQuery == null || pageQuery.getPageSize() == null ? 20L : pageQuery.getPageSize();
        long offset = (pageIndex - 1) * pageSize;
        long total = mapper.countPage(projectId, status);
        List<RenderJobDO> rows = total == 0 ? List.of()
                : mapper.selectPage(projectId, status, offset, (int) pageSize);
        List<RenderJob> records = new ArrayList<>(rows.size());
        for (RenderJobDO r : rows) {
            RenderJob j = RenderJobConvertor.INSTANCE.from(r);
            j.setRenderConfig(decodeConfig(r.getRenderConfigJson()));
            records.add(j);
        }
        return PageInfo.<RenderJob>builder()
                .pageIndex(pageIndex).pageSize(pageSize).total(total)
                .records(records)
                .build();
    }

    private RenderJob loadAndDecode(Long id) {
        RenderJobDO row = mapper.selectById(id);
        if (row == null) return null;
        RenderJob job = RenderJobConvertor.INSTANCE.from(row);
        job.setRenderConfig(decodeConfig(row.getRenderConfigJson()));
        return job;
    }

    private String encodeConfig(RenderConfig cfg) {
        if (cfg == null) return null;
        try {
            return objectMapper.writeValueAsString(cfg);
        } catch (JsonProcessingException e) {
            log.warn("[render] encode RenderConfig failed", e);
            return null;
        }
    }

    private RenderConfig decodeConfig(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, RenderConfig.class);
        } catch (JsonProcessingException e) {
            log.warn("[render] decode RenderConfig failed: {}", json, e);
            return null;
        }
    }
}
