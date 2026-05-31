package com.beukay.marketing.person.app.composition.executor;

import com.beukay.marketing.person.app.composition.convertor.CompositionDTOConvertor;
import com.beukay.marketing.person.client.composition.cmd.CreateMaterialTagCmd;
import com.beukay.marketing.person.client.composition.dto.MaterialTagDTO;
import com.beukay.marketing.person.domain.composition.ability.MaterialTagService;
import com.beukay.marketing.person.domain.composition.model.MaterialTag;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MaterialTagCmdExecutor {

    private final MaterialTagService materialTagService;

    public MaterialTagDTO create(CreateMaterialTagCmd cmd) {
        MaterialTag tag = MaterialTag.builder()
                .name(cmd.getName())
                .category(cmd.getCategory())
                .color(cmd.getColor())
                .description(cmd.getDescription())
                .build();
        return CompositionDTOConvertor.INSTANCE.toTagDTO(materialTagService.createIfAbsent(tag));
    }

    public void delete(Long id) {
        materialTagService.delete(id);
    }
}
