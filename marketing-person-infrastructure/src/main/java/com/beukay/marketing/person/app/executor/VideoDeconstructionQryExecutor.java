package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.convertor.VideoDeconstructionDTOConvertor;
import com.beukay.marketing.person.client.dto.VideoDeconstructionDTO;
import com.beukay.marketing.person.client.qry.VideoDeconstructionPageQry;
import com.beukay.marketing.person.domain.videoDeconstructionResult.gateway.VideoDeconstructionResultGateway;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;
import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResultListCriteriaQuery;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Log4j2
@Component
@RequiredArgsConstructor
public class VideoDeconstructionQryExecutor {

    private final VideoDeconstructionResultGateway videoDeconstructionResultGateway;

    public PageInfo<VideoDeconstructionDTO> listPage(VideoDeconstructionPageQry qry) {
        PageInfo<VideoDeconstructionResult> pageInfo = videoDeconstructionResultGateway.listPage(
                VideoDeconstructionResultListCriteriaQuery.builder()
                        .skuId(qry.getSkuId())
                        .hookType(qry.getHookType())
                        .verificationStatus(qry.getVerificationStatus())
                        .build(),
                qry.getPageQuery());

        List<VideoDeconstructionDTO> records = pageInfo.getRecords().stream()
                .map(VideoDeconstructionDTOConvertor.INSTANCE::convert)
                .collect(Collectors.toList());

        PageInfo<VideoDeconstructionDTO> result = new PageInfo<>();
        result.setPageIndex(pageInfo.getPageIndex());
        result.setPageSize(pageInfo.getPageSize());
        result.setTotal(pageInfo.getTotal());
        result.setRecords(records);
        return result;
    }
}
