package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.beukay.marketing.person.dbsdk.dao.CmVideoSegmentDOMapper;
import com.beukay.marketing.person.dbsdk.model.CmVideoSegmentDO;
import com.beukay.marketing.person.domain.cutmatrix.segment.gateway.CmVideoSegmentGateway;
import com.beukay.marketing.person.domain.cutmatrix.segment.model.CmVideoSegment;
import com.beukay.marketing.person.infrastructure.convertor.CmVideoSegmentConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CmVideoSegmentGatewayImpl implements CmVideoSegmentGateway {

    private final CmVideoSegmentDOMapper mapper;

    @Override
    public Long save(CmVideoSegment segment) {
        if (segment.getId() == null) {
            CmVideoSegmentDO doObj = CmVideoSegmentConvertor.INSTANCE.to(segment);
            mapper.insert(doObj);
            return doObj.getId();
        }
        mapper.updateById(CmVideoSegmentConvertor.INSTANCE.to(segment));
        return segment.getId();
    }

    @Override
    public int batchSave(List<CmVideoSegment> segments) {
        int count = 0;
        for (CmVideoSegment s : segments) {
            CmVideoSegmentDO doObj = CmVideoSegmentConvertor.INSTANCE.to(s);
            mapper.insert(doObj);
            count++;
        }
        return count;
    }

    @Override
    public List<CmVideoSegment> listByCollection(String collectionCode) {
        return mapper.selectList(new LambdaQueryWrapper<CmVideoSegmentDO>()
                .eq(CmVideoSegmentDO::getCollectionCode, collectionCode)
                .eq(CmVideoSegmentDO::getIsDeleted, 0)
                .orderByAsc(CmVideoSegmentDO::getOrderNo))
                .stream().map(CmVideoSegmentConvertor.INSTANCE::from).toList();
    }

    @Override
    public List<CmVideoSegment> listByChapter(String chapterCode) {
        return mapper.selectList(new LambdaQueryWrapper<CmVideoSegmentDO>()
                .eq(CmVideoSegmentDO::getChapterCode, chapterCode)
                .eq(CmVideoSegmentDO::getIsDeleted, 0)
                .orderByAsc(CmVideoSegmentDO::getOrderNo))
                .stream().map(CmVideoSegmentConvertor.INSTANCE::from).toList();
    }

    @Override
    public void deleteByCode(String segmentCode) {
        CmVideoSegmentDO existing = mapper.selectOne(new LambdaQueryWrapper<CmVideoSegmentDO>()
                .eq(CmVideoSegmentDO::getSegmentCode, segmentCode)
                .eq(CmVideoSegmentDO::getIsDeleted, 0)
                .last("limit 1"));
        if (existing != null) {
            existing.setIsDeleted(1);
            mapper.updateById(existing);
        }
    }
}
