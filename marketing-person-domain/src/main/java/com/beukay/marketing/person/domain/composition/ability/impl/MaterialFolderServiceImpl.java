package com.beukay.marketing.person.domain.composition.ability.impl;

import com.beukay.marketing.person.domain.composition.ability.MaterialFolderService;
import com.beukay.marketing.person.domain.composition.gateway.MaterialFolderGateway;
import com.beukay.marketing.person.domain.composition.model.MaterialFolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialFolderServiceImpl implements MaterialFolderService {

    private final MaterialFolderGateway gateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MaterialFolder create(MaterialFolder folder) {
        // code 已存在则直接返回旧的，幂等
        if (folder.getCode() != null && !folder.getCode().isBlank()) {
            MaterialFolder exist = gateway.findByCode(folder.getCode());
            if (exist != null) return exist;
        }
        return gateway.create(folder);
    }

    @Override
    public List<MaterialFolder> listAll() {
        return gateway.listAll();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MaterialFolder update(MaterialFolder folder) {
        return gateway.update(folder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        gateway.softDelete(id);
    }
}
