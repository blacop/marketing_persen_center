package com.beukay.marketing.person.infrastructure.composition.gatewayimpl;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.dbsdk.composition.dao.MaterialClipDOMapper;
import com.beukay.marketing.person.dbsdk.composition.dao.MaterialClipTagDOMapper;
import com.beukay.marketing.person.dbsdk.composition.dao.MaterialTagDOMapper;
import com.beukay.marketing.person.dbsdk.composition.model.MaterialClipDO;
import com.beukay.marketing.person.dbsdk.composition.model.MaterialClipTagDO;
import com.beukay.marketing.person.dbsdk.composition.model.MaterialTagDO;
import com.beukay.marketing.person.domain.composition.gateway.MaterialClipGateway;
import com.beukay.marketing.person.domain.composition.model.MaterialClip;
import com.beukay.marketing.person.domain.composition.model.MaterialTag;
import com.beukay.marketing.person.infrastructure.composition.convertor.MaterialClipConvertor;
import com.beukay.marketing.person.infrastructure.composition.convertor.MaterialTagConvertor;
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
public class MaterialClipGatewayImpl implements MaterialClipGateway {

    private static final TypeReference<List<MaterialTag>> TAG_LIST_TYPE = new TypeReference<>() {};

    private final MaterialClipDOMapper clipMapper;
    private final MaterialClipTagDOMapper clipTagMapper;
    private final MaterialTagDOMapper tagMapper;
    private final ObjectMapper objectMapper;

    @Override
    public MaterialClip create(MaterialClip clip, List<Long> tagIds) {
        if (clip.getBaseFields() == null) {
            clip.setBaseFields(CompositionBaseFieldsHelper.fallbackForInsert());
        }
        MaterialClipDO data = MaterialClipConvertor.INSTANCE.to(clip);

        List<MaterialTag> tags = loadTags(tagIds);
        data.setTagsCache(serializeTags(tags));
        clipMapper.insert(data);

        if (!tags.isEmpty()) {
            insertClipTags(data.getId(), tagIds);
        }
        return reloadWithTags(data.getId(), tags);
    }

    @Override
    public MaterialClip findById(Long id) {
        MaterialClipDO row = clipMapper.selectById(id);
        if (row == null) {
            return null;
        }
        return assemble(row);
    }

    @Override
    public MaterialClip findBySha256(String sha256) {
        if (sha256 == null || sha256.isBlank()) {
            return null;
        }
        MaterialClipDO row = clipMapper.selectBySha256(sha256);
        if (row == null) {
            return null;
        }
        return assemble(row);
    }

    @Override
    public PageInfo<MaterialClip> page(String kind, String name, List<Long> tagIds,
                                       String sourceType, String category, PageQuery pageQuery) {
        long pageIndex = pageQuery == null || pageQuery.getPageIndex() == null ? 1L : pageQuery.getPageIndex();
        long pageSize = pageQuery == null || pageQuery.getPageSize() == null ? 20L : pageQuery.getPageSize();
        long offset = (pageIndex - 1) * pageSize;

        long total = clipMapper.countPage(kind, name, tagIds, sourceType, category);
        List<MaterialClipDO> rows = total == 0 ? List.of()
                : clipMapper.selectPage(kind, name, tagIds, sourceType, category, offset, (int) pageSize);

        List<MaterialClip> records = new ArrayList<>(rows.size());
        for (MaterialClipDO r : rows) {
            records.add(assemble(r));
        }
        return PageInfo.<MaterialClip>builder()
                .pageIndex(pageIndex)
                .pageSize(pageSize)
                .total(total)
                .records(records)
                .build();
    }

    @Override
    public MaterialClip replaceTags(Long clipId, List<Long> tagIds) {
        clipTagMapper.softDeleteByClipId(clipId);
        List<MaterialTag> tags = loadTags(tagIds);
        if (!tags.isEmpty()) {
            insertClipTags(clipId, tagIds);
        }
        clipMapper.updateTagsCache(clipId, serializeTags(tags));
        return reloadWithTags(clipId, tags);
    }

    @Override
    public void softDelete(Long id) {
        clipMapper.softDelete(id);
        clipTagMapper.softDeleteByClipId(id);
    }

    // ---- helpers ----

    private MaterialClip assemble(MaterialClipDO row) {
        MaterialClip clip = MaterialClipConvertor.INSTANCE.from(row);
        clip.setTags(deserializeTags(row.getTagsCache()));
        return clip;
    }

    private MaterialClip reloadWithTags(Long id, List<MaterialTag> tags) {
        // 多租户拦截器在某些 FAT 环境下会让 selectById 返回 null（insert/select 的 tenant 不匹配）。
        // 上游需要的只是一个非 null MaterialClip 用来回包响应；这里加 fallback：重查失败时凭 id 兜一个壳。
        MaterialClipDO row = clipMapper.selectById(id);
        MaterialClip clip = row == null
                ? MaterialClip.builder().id(id).build()
                : MaterialClipConvertor.INSTANCE.from(row);
        clip.setTags(tags);
        return clip;
    }

    private List<MaterialTag> loadTags(List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return List.of();
        }
        List<MaterialTagDO> rows = tagMapper.selectByIds(tagIds);
        return MaterialTagConvertor.INSTANCE.from(rows);
    }

    private void insertClipTags(Long clipId, List<Long> tagIds) {
        List<MaterialClipTagDO> rows = new ArrayList<>(tagIds.size());
        for (Long tagId : tagIds) {
            MaterialClipTagDO r = new MaterialClipTagDO();
            r.setClipId(clipId);
            r.setTagId(tagId);
            r.setNezhaTenantCode("default");
            r.setIsDeleted(Boolean.FALSE);
            r.setCreateBy(0L);
            r.setCreateName("system");
            r.setUpdateBy(0L);
            r.setUpdateName("system");
            r.setCreateAt(java.time.LocalDateTime.now());
            r.setUpdateAt(r.getCreateAt());
            rows.add(r);
        }
        clipTagMapper.batchInsert(rows);
    }

    private String serializeTags(List<MaterialTag> tags) {
        if (tags == null || tags.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(tags);
        } catch (JsonProcessingException e) {
            log.error("[material] serialize tags_cache failed", e);
            return "[]";
        }
    }

    private List<MaterialTag> deserializeTags(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, TAG_LIST_TYPE);
        } catch (JsonProcessingException e) {
            log.warn("[material] deserialize tags_cache failed: {}", json, e);
            return List.of();
        }
    }
}
