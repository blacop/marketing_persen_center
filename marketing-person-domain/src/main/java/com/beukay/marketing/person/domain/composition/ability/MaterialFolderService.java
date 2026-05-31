package com.beukay.marketing.person.domain.composition.ability;

import com.beukay.marketing.person.domain.composition.model.MaterialFolder;

import java.util.List;

public interface MaterialFolderService {

    MaterialFolder create(MaterialFolder folder);

    List<MaterialFolder> listAll();

    MaterialFolder update(MaterialFolder folder);

    void delete(Long id);
}
