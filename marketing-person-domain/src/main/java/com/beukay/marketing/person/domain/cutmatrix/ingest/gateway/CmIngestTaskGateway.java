package com.beukay.marketing.person.domain.cutmatrix.ingest.gateway;

import com.beukay.marketing.person.domain.cutmatrix.ingest.model.CmIngestTask;

import java.util.List;

public interface CmIngestTaskGateway {
    Long save(CmIngestTask task);
    CmIngestTask getByCode(String taskCode);
    List<CmIngestTask> listAll(int limit);
    List<CmIngestTask> listByCodes(List<String> taskCodes);
    void deleteByCode(String taskCode);
}
