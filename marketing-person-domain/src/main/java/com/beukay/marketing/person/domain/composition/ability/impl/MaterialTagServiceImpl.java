package com.beukay.marketing.person.domain.composition.ability.impl;

import com.beukay.marketing.person.domain.composition.ability.MaterialTagService;
import com.beukay.marketing.person.domain.composition.gateway.MaterialTagGateway;
import com.beukay.marketing.person.domain.composition.model.MaterialTag;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialTagServiceImpl implements MaterialTagService {

    private final MaterialTagGateway materialTagGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MaterialTag createIfAbsent(MaterialTag tag) {
        return materialTagGateway.createIfAbsent(tag);
    }

    @Override
    public List<MaterialTag> list(String category) {
        return materialTagGateway.listAll(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        materialTagGateway.softDelete(id);
    }
}
