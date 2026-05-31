package com.beukay.marketing.person.app.composition.executor;

import com.beukay.marketing.person.client.composition.dto.MaterialFolderDTO;
import com.beukay.marketing.person.domain.composition.ability.MaterialFolderService;
import com.beukay.marketing.person.domain.composition.model.MaterialFolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MaterialFolderQryExecutor {

    private final MaterialFolderService service;

    public List<MaterialFolderDTO> listAll() {
        return service.listAll().stream().map(this::toDTO).toList();
    }

    private MaterialFolderDTO toDTO(MaterialFolder f) {
        return MaterialFolderDTO.builder()
                .id(f.getId()).code(f.getCode()).name(f.getName())
                .sortNo(f.getSortNo()).color(f.getColor()).description(f.getDescription())
                .refAudioOssKey(f.getRefAudioOssKey())
                .refAudioDurationMs(f.getRefAudioDurationMs())
                .refAudioFilename(f.getRefAudioFilename())
                .build();
    }
}
