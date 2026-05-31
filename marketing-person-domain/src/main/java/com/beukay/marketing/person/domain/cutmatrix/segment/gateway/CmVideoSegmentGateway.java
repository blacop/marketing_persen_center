package com.beukay.marketing.person.domain.cutmatrix.segment.gateway;

import com.beukay.marketing.person.domain.cutmatrix.segment.model.CmVideoSegment;

import java.util.List;

public interface CmVideoSegmentGateway {
    Long save(CmVideoSegment segment);
    int batchSave(List<CmVideoSegment> segments);
    List<CmVideoSegment> listByCollection(String collectionCode);
    List<CmVideoSegment> listByChapter(String chapterCode);
    void deleteByCode(String segmentCode);
}
