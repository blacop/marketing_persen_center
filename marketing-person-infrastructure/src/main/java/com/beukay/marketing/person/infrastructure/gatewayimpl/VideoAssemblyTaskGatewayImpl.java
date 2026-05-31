package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.ai.common.mybatis.util.PageUtil;
import com.beukay.marketing.person.dbsdk.dao.VideoAssemblyTaskDOMapper;
import com.beukay.marketing.person.dbsdk.model.VideoAssemblyTaskDO;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyTaskGateway;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyTask;
import com.beukay.marketing.person.infrastructure.convertor.VideoAssemblyTaskConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class VideoAssemblyTaskGatewayImpl implements VideoAssemblyTaskGateway {
    private final VideoAssemblyTaskDOMapper mapper;
    @Override public Long create(VideoAssemblyTask task) { VideoAssemblyTaskDO doObj = VideoAssemblyTaskConvertor.INSTANCE.to(task); mapper.insert(doObj); return doObj.getId(); }
    @Override public void update(VideoAssemblyTask task) { mapper.updateById(VideoAssemblyTaskConvertor.INSTANCE.to(task)); }
    @Override public VideoAssemblyTask queryById(Long id) { VideoAssemblyTaskDO doObj = mapper.selectOne(new LambdaQueryWrapper<VideoAssemblyTaskDO>().eq(VideoAssemblyTaskDO::getId, id).eq(VideoAssemblyTaskDO::getIsDeleted, 0).last("limit 1")); return doObj == null ? null : VideoAssemblyTaskConvertor.INSTANCE.from(doObj); }
    @Override public VideoAssemblyTask queryByTaskCode(String taskCode) { VideoAssemblyTaskDO doObj = mapper.selectOne(new LambdaQueryWrapper<VideoAssemblyTaskDO>().eq(VideoAssemblyTaskDO::getTaskCode, taskCode).eq(VideoAssemblyTaskDO::getIsDeleted, 0).last("limit 1")); return doObj == null ? null : VideoAssemblyTaskConvertor.INSTANCE.from(doObj); }

    @Override
    public PageInfo<VideoAssemblyTask> listPage(String status, String blueprintCode, PageQuery pageQuery) {
        IPage<VideoAssemblyTaskDO> page = mapper.selectPage(PageUtil.toIPage(pageQuery),
                new LambdaQueryWrapper<VideoAssemblyTaskDO>()
                        .eq(VideoAssemblyTaskDO::getIsDeleted, 0)
                        .eq(status != null && !status.isBlank(), VideoAssemblyTaskDO::getStatus, status)
                        .eq(blueprintCode != null && !blueprintCode.isBlank(), VideoAssemblyTaskDO::getBlueprintCode, blueprintCode)
                        .orderByDesc(VideoAssemblyTaskDO::getId));
        List<VideoAssemblyTask> records = page.getRecords().stream()
                .map(VideoAssemblyTaskConvertor.INSTANCE::from)
                .toList();
        return PageUtil.of(records, page.getTotal(), page.getSize(), page.getCurrent());
    }
}
