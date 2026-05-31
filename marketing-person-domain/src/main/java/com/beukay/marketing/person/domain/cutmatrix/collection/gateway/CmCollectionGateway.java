package com.beukay.marketing.person.domain.cutmatrix.collection.gateway;

import com.beukay.marketing.person.domain.cutmatrix.collection.model.CmCollection;

import java.util.List;

public interface CmCollectionGateway {
    Long save(CmCollection collection);
    CmCollection getByCode(String collectionCode);
    List<CmCollection> listAll();
    void deleteByCode(String collectionCode);
}
