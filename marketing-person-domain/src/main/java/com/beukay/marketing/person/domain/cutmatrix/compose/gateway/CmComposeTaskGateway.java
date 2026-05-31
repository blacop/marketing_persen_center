package com.beukay.marketing.person.domain.cutmatrix.compose.gateway;

import com.beukay.marketing.person.domain.cutmatrix.compose.model.CmComposeTask;

import java.util.List;

public interface CmComposeTaskGateway {
    Long save(CmComposeTask task);
    CmComposeTask getByCode(String taskCode);
    List<CmComposeTask> listByCollection(String collectionCode);
}
