package com.beukay.marketing.person.domain.cutmatrix.chapter.gateway;

import com.beukay.marketing.person.domain.cutmatrix.chapter.model.CmChapter;

import java.util.List;

public interface CmChapterGateway {
    Long save(CmChapter chapter);
    CmChapter getByCode(String chapterCode);
    CmChapter findByCollectionAndStage(String collectionCode, String stageCode);
    List<CmChapter> listByCollection(String collectionCode);
    void deleteByCode(String chapterCode);
}
