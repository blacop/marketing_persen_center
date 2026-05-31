package com.beukay.marketing.person.infrastructure.composition.gatewayimpl;

import com.beukay.marketing.person.dbsdk.composition.dao.MaterialTagDOMapper;
import com.beukay.marketing.person.dbsdk.composition.model.MaterialTagDO;
import com.beukay.marketing.person.domain.composition.gateway.MaterialTagGateway;
import com.beukay.marketing.person.domain.composition.model.MaterialTag;
import com.beukay.marketing.person.infrastructure.composition.convertor.MaterialTagConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MaterialTagGatewayImpl implements MaterialTagGateway {

    private final MaterialTagDOMapper mapper;

    @Override
    public MaterialTag createIfAbsent(MaterialTag tag) {
        MaterialTagDO exist = mapper.selectByNameAndCategory(tag.getName(), tag.getCategory());
        if (exist != null) {
            return MaterialTagConvertor.INSTANCE.from(exist);
        }
        if (tag.getBaseFields() == null) {
            tag.setBaseFields(CompositionBaseFieldsHelper.fallbackForInsert());
        }
        MaterialTagDO data = MaterialTagConvertor.INSTANCE.to(tag);
        mapper.insert(data);
        MaterialTagDO row = mapper.selectById(data.getId());
        return MaterialTagConvertor.INSTANCE.from(row != null ? row : data);
    }

    @Override
    public MaterialTag findById(Long id) {
        return MaterialTagConvertor.INSTANCE.from(mapper.selectById(id));
    }

    @Override
    public List<MaterialTag> findByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return MaterialTagConvertor.INSTANCE.from(mapper.selectByIds(ids));
    }

    @Override
    public List<MaterialTag> listAll(String category) {
        return MaterialTagConvertor.INSTANCE.from(mapper.selectAll(category));
    }

    @Override
    public void softDelete(Long id) {
        mapper.softDelete(id);
    }
}
