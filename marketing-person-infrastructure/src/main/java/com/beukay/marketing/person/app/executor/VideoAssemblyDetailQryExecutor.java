package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.convertor.VideoAssemblyCandidateDTOConvertor;
import com.beukay.marketing.person.app.convertor.VideoAssemblyDTOConvertor;
import com.beukay.marketing.person.app.convertor.VideoAssemblyPlanSectionDTOConvertor;
import com.beukay.marketing.person.client.dto.VideoAssemblyDTO;
import com.beukay.marketing.person.client.qry.VideoAssemblyPageQry;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyTask;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyCandidateGateway;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyPlanGateway;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyTaskGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class VideoAssemblyDetailQryExecutor {
    private final VideoAssemblyTaskGateway videoAssemblyTaskGateway;
    private final VideoAssemblyCandidateGateway videoAssemblyCandidateGateway;
    private final VideoAssemblyPlanGateway videoAssemblyPlanGateway;

    public VideoAssemblyDTO getById(Long id) {
        VideoAssemblyTask task = videoAssemblyTaskGateway.queryById(id);
        return toDto(task);
    }

    public VideoAssemblyDTO getByTaskCode(String taskCode) {
        VideoAssemblyTask task = videoAssemblyTaskGateway.queryByTaskCode(taskCode);
        return toDto(task);
    }

    public PageInfo<VideoAssemblyDTO> listPage(VideoAssemblyPageQry qry) {
        PageInfo<VideoAssemblyTask> pageInfo = videoAssemblyTaskGateway.listPage(
                qry.getStatus(), qry.getBlueprintCode(), qry.getPageQuery());
        List<VideoAssemblyDTO> records = pageInfo.getRecords().stream()
                .map(VideoAssemblyDTOConvertor.INSTANCE::convert)
                .toList();
        PageInfo<VideoAssemblyDTO> result = new PageInfo<>();
        result.setRecords(records);
        result.setTotal(pageInfo.getTotal());
        result.setPageIndex(pageInfo.getPageIndex());
        result.setPageSize(pageInfo.getPageSize());
        return result;
    }

    private VideoAssemblyDTO toDto(VideoAssemblyTask task) {
        VideoAssemblyDTO dto = VideoAssemblyDTOConvertor.INSTANCE.convert(task);
        dto.setCandidates(videoAssemblyCandidateGateway.listByTaskCode(task.getTaskCode()).stream()
                .map(VideoAssemblyCandidateDTOConvertor.INSTANCE::convert)
                .toList());
        dto.setPlanSections(videoAssemblyPlanGateway.listByTaskCode(task.getTaskCode()).stream()
                .map(VideoAssemblyPlanSectionDTOConvertor.INSTANCE::convert)
                .toList());
        return dto;
    }
}
