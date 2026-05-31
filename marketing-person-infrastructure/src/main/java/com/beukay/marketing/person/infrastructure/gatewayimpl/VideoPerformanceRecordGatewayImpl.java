package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.beukay.marketing.person.dbsdk.dao.VideoPerformanceRecordDOMapper;
import com.beukay.marketing.person.dbsdk.model.VideoPerformanceRecordDO;
import com.beukay.marketing.person.domain.videoPerformanceRecord.gateway.VideoPerformanceRecordGateway;
import com.beukay.marketing.person.domain.videoPerformanceRecord.model.VideoPerformanceRecord;
import com.beukay.marketing.person.infrastructure.convertor.VideoPerformanceRecordConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VideoPerformanceRecordGatewayImpl implements VideoPerformanceRecordGateway {

    private final VideoPerformanceRecordDOMapper mapper;

    @Override
    public VideoPerformanceRecord queryById(Long id) {
        VideoPerformanceRecordDO doObj = mapper.selectById(id);
        return doObj == null ? null : VideoPerformanceRecordConvertor.INSTANCE.from(doObj);
    }
}
