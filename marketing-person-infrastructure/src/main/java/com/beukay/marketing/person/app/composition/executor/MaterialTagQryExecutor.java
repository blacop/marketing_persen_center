package com.beukay.marketing.person.app.composition.executor;

import com.beukay.marketing.person.app.composition.convertor.CompositionDTOConvertor;
import com.beukay.marketing.person.client.composition.dto.MaterialTagDTO;
import com.beukay.marketing.person.domain.composition.ability.MaterialTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MaterialTagQryExecutor {

    private final MaterialTagService materialTagService;

    public List<MaterialTagDTO> list(String category) {
        return CompositionDTOConvertor.INSTANCE.toTagDTOList(materialTagService.list(category));
    }
}
