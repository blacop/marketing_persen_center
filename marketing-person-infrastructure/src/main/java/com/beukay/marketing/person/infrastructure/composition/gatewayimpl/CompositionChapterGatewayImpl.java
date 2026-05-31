package com.beukay.marketing.person.infrastructure.composition.gatewayimpl;

import com.beukay.marketing.person.dbsdk.composition.dao.CompositionChapterDOMapper;
import com.beukay.marketing.person.dbsdk.composition.model.CompositionChapterDO;
import com.beukay.marketing.person.domain.composition.gateway.CompositionChapterGateway;
import com.beukay.marketing.person.domain.composition.model.CompositionChapter;
import com.beukay.marketing.person.infrastructure.composition.convertor.CompositionChapterConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CompositionChapterGatewayImpl implements CompositionChapterGateway {

    private final CompositionChapterDOMapper mapper;
    private final ChapterTagFilterCodec tagFilterCodec;

    @Override
    public List<CompositionChapter> replaceAll(Long projectId, List<CompositionChapter> chapters) {
        // 1. 区分 update / insert
        List<CompositionChapter> toInsert = new ArrayList<>();
        List<CompositionChapterDO> toInsertDO = new ArrayList<>();
        List<Long> keepIds = new ArrayList<>();
        for (CompositionChapter ch : chapters) {
            ch.setProjectId(projectId);
            if (ch.getBaseFields() == null) {
                ch.setBaseFields(CompositionBaseFieldsHelper.fallbackForInsert());
            }
            CompositionChapterDO data = CompositionChapterConvertor.INSTANCE.to(ch);
            data.setTagFilter(tagFilterCodec.encode(ch.getTagFilter()));
            data.setMaterialClipIds(encodeClipIds(ch.getMaterialClipIds()));
            data.setVoiceoverIds(encodeClipIds(ch.getVoiceoverIds()));
            if (data.getId() == null) {
                toInsert.add(ch);
                toInsertDO.add(data);
            } else {
                mapper.update(data);
                keepIds.add(data.getId());
            }
        }
        // 2. 批量插入新章节
        if (!toInsertDO.isEmpty()) {
            mapper.batchInsert(toInsertDO);
            for (int i = 0; i < toInsert.size(); i++) {
                toInsert.get(i).setId(toInsertDO.get(i).getId());
                keepIds.add(toInsertDO.get(i).getId());
            }
        }
        // 3. 软删除不在 keep 列表的旧章节
        if (keepIds.isEmpty()) {
            mapper.softDeleteByProjectId(projectId);
        } else {
            mapper.softDeleteNotIn(projectId, keepIds);
        }
        // 4. 返回最新列表
        return findByProjectId(projectId);
    }

    @Override
    public List<CompositionChapter> findByProjectId(Long projectId) {
        List<CompositionChapterDO> rows = mapper.selectByProjectId(projectId);
        List<CompositionChapter> out = new ArrayList<>(rows.size());
        for (CompositionChapterDO r : rows) {
            CompositionChapter c = CompositionChapterConvertor.INSTANCE.from(r);
            c.setTagFilter(tagFilterCodec.decode(r.getTagFilter()));
            c.setMaterialClipIds(decodeClipIds(r.getMaterialClipIds()));
            c.setVoiceoverIds(decodeClipIds(r.getVoiceoverIds()));
            out.add(c);
        }
        return out;
    }

    @Override
    public void softDeleteAll(Long projectId) {
        mapper.softDeleteByProjectId(projectId);
    }

    private static String encodeClipIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return null;
        return ids.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private static List<Long> decodeClipIds(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::valueOf)
                .toList();
    }
}
