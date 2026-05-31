package com.beukay.marketing.person.domain.videoDeconstructionResult.ability;

import com.beukay.marketing.person.domain.videoDeconstructionResult.model.VideoDeconstructionResult;

public interface VideoDeconstructionResultDomainService {

    Long create(VideoDeconstructionResult result);

    void update(VideoDeconstructionResult result);

    VideoDeconstructionResult queryById(Long id);

    VideoDeconstructionResult queryByRecordId(Long recordId);

    VideoDeconstructionResult queryByVideoId(String videoId);
}
