package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.app.service.VideoUnderstandingTaskAppService;
import com.beukay.marketing.person.client.dto.VideoDeconstructionTaskDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Log4j2
public class VideoDeconstructionTaskQryExecutor {

    private final VideoUnderstandingTaskAppService videoUnderstandingTaskAppService;

    public VideoDeconstructionTaskDTO get(String taskId) {
        return videoUnderstandingTaskAppService.getTask(taskId);
    }
}
