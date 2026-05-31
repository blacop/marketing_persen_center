package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.KolPersonDTO;
import com.beukay.marketing.person.domain.kolPerson.model.KolPerson;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

/**
 * Domain -> DTO 转换器
 */
@Mapper
public interface KolPersonDTOConvertor {

    KolPersonDTOConvertor INSTANCE = Mappers.getMapper(KolPersonDTOConvertor.class);

    default KolPersonDTO convert(KolPerson kolPerson) {
        return KolPersonDTO.builder()
                .id(kolPerson.getId())
                .name(kolPerson.getName())
                .description(kolPerson.getDescription())
                .status(kolPerson.getStatus())
                .createAt(kolPerson.getBaseFields() != null ? kolPerson.getBaseFields().getCreateAt() : null)
                .createName(kolPerson.getBaseFields() != null ? kolPerson.getBaseFields().getCreateName() : null)
                .build();
    }

}
