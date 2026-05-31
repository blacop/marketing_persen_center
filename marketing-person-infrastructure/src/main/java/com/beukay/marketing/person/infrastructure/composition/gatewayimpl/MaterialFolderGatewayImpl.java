package com.beukay.marketing.person.infrastructure.composition.gatewayimpl;

import com.beukay.marketing.person.dbsdk.composition.dao.MaterialFolderDOMapper;
import com.beukay.marketing.person.dbsdk.composition.model.MaterialFolderDO;
import com.beukay.marketing.person.domain.composition.gateway.MaterialFolderGateway;
import com.beukay.marketing.person.domain.composition.model.MaterialFolder;
import com.beukay.marketing.person.infrastructure.composition.convertor.MaterialFolderConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MaterialFolderGatewayImpl implements MaterialFolderGateway {

    private final MaterialFolderDOMapper mapper;

    @Override
    public MaterialFolder create(MaterialFolder folder) {
        if (folder.getBaseFields() == null) {
            folder.setBaseFields(CompositionBaseFieldsHelper.fallbackForInsert());
        }
        if (folder.getCode() == null || folder.getCode().isBlank()) {
            folder.setCode("custom_" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (folder.getSortNo() == null) {
            folder.setSortNo(nextSortNo());
        }
        MaterialFolderDO data = MaterialFolderConvertor.INSTANCE.to(folder);
        mapper.insert(data);
        MaterialFolderDO row = mapper.selectById(data.getId());
        return MaterialFolderConvertor.INSTANCE.from(row != null ? row : data);
    }

    @Override
    public MaterialFolder findById(Long id) {
        MaterialFolderDO row = mapper.selectById(id);
        return row == null ? null : MaterialFolderConvertor.INSTANCE.from(row);
    }

    @Override
    public MaterialFolder findByCode(String code) {
        if (code == null || code.isBlank()) return null;
        MaterialFolderDO row = mapper.selectByCode(code);
        return row == null ? null : MaterialFolderConvertor.INSTANCE.from(row);
    }

    @Override
    public List<MaterialFolder> listAll() {
        return MaterialFolderConvertor.INSTANCE.from(mapper.selectAll());
    }

    @Override
    public MaterialFolder update(MaterialFolder folder) {
        MaterialFolderDO data = MaterialFolderConvertor.INSTANCE.to(folder);
        mapper.update(data);
        MaterialFolder reloaded = findById(folder.getId());
        return reloaded != null ? reloaded : MaterialFolderConvertor.INSTANCE.from(data);
    }

    @Override
    public void softDelete(Long id) {
        mapper.softDelete(id);
    }

    private int nextSortNo() {
        return mapper.selectAll().stream()
                .map(MaterialFolderDO::getSortNo)
                .filter(java.util.Objects::nonNull)
                .max(Integer::compareTo)
                .map(m -> m + 1)
                .orElse(1);
    }
}
