package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.ai.common.mybatis.util.PageUtil;
import com.beukay.marketing.person.dbsdk.dao.VideoDeconstructionResultDOMapper;
import com.beukay.marketing.person.dbsdk.model.VideoDeconstructionResultDO;
import com.beukay.marketing.person.domain.videoDeconstructionResult.gateway.VideoDeconstructionResultGateway;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResultListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.convertor.VideoDeconstructionResultConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class VideoDeconstructionResultGatewayImpl implements VideoDeconstructionResultGateway {

    private final VideoDeconstructionResultDOMapper mapper;

    @Override
    public Long create(VideoDeconstructionResult result) {
        VideoDeconstructionResultDO doObj = VideoDeconstructionResultConvertor.INSTANCE.to(result);
        mapper.insert(doObj);
        return doObj.getId();
    }

    @Override
    public void update(VideoDeconstructionResult result) {
        mapper.updateById(VideoDeconstructionResultConvertor.INSTANCE.to(result));
    }

    @Override
    public VideoDeconstructionResult queryById(Long id) {
        VideoDeconstructionResultDO doObj = mapper.selectById(id);
        return doObj == null ? null : VideoDeconstructionResultConvertor.INSTANCE.from(doObj);
    }

    @Override
    public VideoDeconstructionResult queryByRecordId(Long recordId) {
        VideoDeconstructionResultDO doObj = mapper.selectOne(new LambdaQueryWrapper<VideoDeconstructionResultDO>()
                .eq(VideoDeconstructionResultDO::getRecordId, recordId)
                .eq(VideoDeconstructionResultDO::getIsDeleted, 0)
                .last("limit 1"));
        return doObj == null ? null : VideoDeconstructionResultConvertor.INSTANCE.from(doObj);
    }

    @Override
    public VideoDeconstructionResult queryByVideoId(String videoId) {
        VideoDeconstructionResultDO doObj = mapper.selectOne(new LambdaQueryWrapper<VideoDeconstructionResultDO>()
                .eq(VideoDeconstructionResultDO::getVideoId, videoId)
                .eq(VideoDeconstructionResultDO::getIsDeleted, 0)
                .last("limit 1"));
        return doObj == null ? null : VideoDeconstructionResultConvertor.INSTANCE.from(doObj);
    }

    @Override
    public List<VideoDeconstructionResult> listBySkuId(String skuId) {
        return mapper.selectList(new LambdaQueryWrapper<VideoDeconstructionResultDO>()
                        .eq(VideoDeconstructionResultDO::getSkuId, skuId)
                        .eq(VideoDeconstructionResultDO::getIsDeleted, 0)
                        .orderByDesc(VideoDeconstructionResultDO::getActualPerformanceScore)
                        .orderByDesc(VideoDeconstructionResultDO::getId))
                .stream()
                .map(VideoDeconstructionResultConvertor.INSTANCE::from)
                .collect(Collectors.toList());
    }

    @Override
    public PageInfo<VideoDeconstructionResult> listPage(VideoDeconstructionResultListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
        IPage<VideoDeconstructionResultDO> page = mapper.selectPage(PageUtil.toIPage(pageQuery),
                new LambdaQueryWrapper<VideoDeconstructionResultDO>()
                        .eq(VideoDeconstructionResultDO::getIsDeleted, 0)
                        .eq(criteriaQuery.getSkuId() != null && !criteriaQuery.getSkuId().isBlank(), VideoDeconstructionResultDO::getSkuId, criteriaQuery.getSkuId())
                        .eq(criteriaQuery.getHookType() != null && !criteriaQuery.getHookType().isBlank(), VideoDeconstructionResultDO::getHookType, criteriaQuery.getHookType())
                        .eq(criteriaQuery.getVerificationStatus() != null && !criteriaQuery.getVerificationStatus().isBlank(), VideoDeconstructionResultDO::getVerificationStatus, criteriaQuery.getVerificationStatus())
                        .orderByDesc(VideoDeconstructionResultDO::getId));

        List<VideoDeconstructionResult> records = page.getRecords().stream()
                .map(VideoDeconstructionResultConvertor.INSTANCE::from)
                .collect(Collectors.toList());
        return PageUtil.of(records, page.getTotal(), page.getSize(), page.getCurrent());
    }
}
