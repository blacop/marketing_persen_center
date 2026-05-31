package com.beukay.marketing.person.domain.composition.gateway;

import com.beukay.marketing.person.domain.composition.model.MaterialFolder;

import java.util.List;

public interface MaterialFolderGateway {

    MaterialFolder create(MaterialFolder folder);

    MaterialFolder findById(Long id);

    MaterialFolder findByCode(String code);

    List<MaterialFolder> listAll();

    MaterialFolder update(MaterialFolder folder);

    void softDelete(Long id);
}
