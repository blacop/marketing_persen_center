package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.beukay.marketing.person.dbsdk.dao.CmChapterDOMapper;
import com.beukay.marketing.person.dbsdk.model.CmChapterDO;
import com.beukay.marketing.person.domain.cutmatrix.chapter.gateway.CmChapterGateway;
import com.beukay.marketing.person.domain.cutmatrix.chapter.model.CmChapter;
import com.beukay.marketing.person.infrastructure.convertor.CmChapterConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CmChapterGatewayImpl implements CmChapterGateway {

    private final CmChapterDOMapper mapper;

    @Override
    public Long save(CmChapter chapter) {
        if (chapter.getId() == null) {
            CmChapterDO doObj = CmChapterConvertor.INSTANCE.to(chapter);
            mapper.insert(doObj);
            return doObj.getId();
        }
        mapper.updateById(CmChapterConvertor.INSTANCE.to(chapter));
        return chapter.getId();
    }

    @Override
    public CmChapter getByCode(String chapterCode) {
        CmChapterDO doObj = mapper.selectOne(new LambdaQueryWrapper<CmChapterDO>()
                .eq(CmChapterDO::getChapterCode, chapterCode)
                .eq(CmChapterDO::getIsDeleted, 0)
                .last("limit 1"));
        return doObj == null ? null : CmChapterConvertor.INSTANCE.from(doObj);
    }

    @Override
    public CmChapter findByCollectionAndStage(String collectionCode, String stageCode) {
        CmChapterDO doObj = mapper.selectOne(new LambdaQueryWrapper<CmChapterDO>()
                .eq(CmChapterDO::getCollectionCode, collectionCode)
                .eq(CmChapterDO::getStageCode, stageCode)
                .eq(CmChapterDO::getIsDeleted, 0)
                .last("limit 1"));
        return doObj == null ? null : CmChapterConvertor.INSTANCE.from(doObj);
    }

    @Override
    public List<CmChapter> listByCollection(String collectionCode) {
        return mapper.selectList(new LambdaQueryWrapper<CmChapterDO>()
                .eq(CmChapterDO::getCollectionCode, collectionCode)
                .eq(CmChapterDO::getIsDeleted, 0)
                .orderByAsc(CmChapterDO::getOrderNo))
                .stream().map(CmChapterConvertor.INSTANCE::from).toList();
    }

    @Override
    public void deleteByCode(String chapterCode) {
        CmChapterDO existing = mapper.selectOne(new LambdaQueryWrapper<CmChapterDO>()
                .eq(CmChapterDO::getChapterCode, chapterCode)
                .eq(CmChapterDO::getIsDeleted, 0)
                .last("limit 1"));
        if (existing != null) {
            existing.setIsDeleted(1);
            mapper.updateById(existing);
        }
    }
}
