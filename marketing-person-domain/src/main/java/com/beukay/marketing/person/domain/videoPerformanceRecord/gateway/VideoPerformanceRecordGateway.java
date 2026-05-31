package com.beukay.marketing.person.domain.videoPerformanceRecord.gateway;

import com.beukay.marketing.person.domain.videoPerformanceRecord.model.VideoPerformanceRecord;

public interface VideoPerformanceRecordGateway {

    VideoPerformanceRecord queryById(Long id);
}
