package com.beukay.marketing.person.infrastructure.composition.gatewayimpl;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.dbsdk.composition.dao.CompositionProjectDOMapper;
import com.beukay.marketing.person.dbsdk.composition.model.CompositionProjectDO;
import com.beukay.marketing.person.domain.composition.gateway.CompositionChapterGateway;
import com.beukay.marketing.person.domain.composition.gateway.CompositionProjectGateway;
import com.beukay.marketing.person.domain.composition.model.CompositionProject;
import com.beukay.marketing.person.infrastructure.composition.convertor.CompositionProjectConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CompositionProjectGatewayImpl implements CompositionProjectGateway {

    private final CompositionProjectDOMapper projectMapper;
    private final CompositionChapterGateway chapterGateway;

    @Override
    public CompositionProject save(CompositionProject project) {
        if (project.getBaseFields() == null) {
            project.setBaseFields(CompositionBaseFieldsHelper.fallbackForInsert());
        }
        CompositionProjectDO data = CompositionProjectConvertor.INSTANCE.to(project);
        data.setBgmVoiceoverIds(encodeIds(project.getBgmVoiceoverIds()));
        if (data.getId() == null) {
            projectMapper.insert(data);
        } else {
            projectMapper.update(data);
        }
        // 重查一次以拿到 DB 兜底字段；若被多租户拦截器过滤导致重查为 null，回退到刚写入的 in-memory DO，
        // 避免 caller 拿到 null 后续 NPE（云端 FAT 环境无 TenantHolder 上下文时会触发）。
        CompositionProject reloaded = loadAndDecode(data.getId());
        if (reloaded != null) {
            return reloaded;
        }
        CompositionProject fallback = CompositionProjectConvertor.INSTANCE.from(data);
        fallback.setBgmVoiceoverIds(decodeIds(data.getBgmVoiceoverIds()));
        return fallback;
    }

    @Override
    public CompositionProject findById(Long id) {
        return loadAndDecode(id);
    }

    @Override
    public CompositionProject findDetailById(Long id) {
        CompositionProject project = loadAndDecode(id);
        if (project == null) return null;
        // 复用 chapterGateway.findByProjectId：已正确解码 tagFilter 与 materialClipIds（CSV→List<Long>）
        project.setChapters(chapterGateway.findByProjectId(id));
        return project;
    }

    @Override
    public PageInfo<CompositionProject> page(String mode, String status, String name, String chapterSource, PageQuery pageQuery) {
        long pageIndex = pageQuery == null || pageQuery.getPageIndex() == null ? 1L : pageQuery.getPageIndex();
        long pageSize = pageQuery == null || pageQuery.getPageSize() == null ? 20L : pageQuery.getPageSize();
        long offset = (pageIndex - 1) * pageSize;
        long total = projectMapper.countPage(mode, status, name, chapterSource);
        List<CompositionProjectDO> rows = total == 0 ? List.of()
                : projectMapper.selectPage(mode, status, name, chapterSource, offset, (int) pageSize);
        List<CompositionProject> records = new ArrayList<>(rows.size());
        for (CompositionProjectDO r : rows) {
            CompositionProject p = CompositionProjectConvertor.INSTANCE.from(r);
            p.setBgmVoiceoverIds(decodeIds(r.getBgmVoiceoverIds()));
            records.add(p);
        }
        return PageInfo.<CompositionProject>builder()
                .pageIndex(pageIndex).pageSize(pageSize).total(total)
                .records(records)
                .build();
    }

    @Override
    public void softDelete(Long id) {
        projectMapper.softDelete(id);
    }

    private CompositionProject loadAndDecode(Long id) {
        CompositionProjectDO row = projectMapper.selectById(id);
        if (row == null) return null;
        CompositionProject project = CompositionProjectConvertor.INSTANCE.from(row);
        project.setBgmVoiceoverIds(decodeIds(row.getBgmVoiceoverIds()));
        return project;
    }

    private static String encodeIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return null;
        return ids.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private static List<Long> decodeIds(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::valueOf)
                .toList();
    }
}
