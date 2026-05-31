package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.app.convertor.VideoAssemblyDTOConvertor;
import com.beukay.marketing.person.app.service.VideoAssemblyGenerateAppService;
import com.beukay.marketing.person.client.cmd.VideoAssemblyGenerateCmd;
import com.beukay.marketing.person.client.dto.VideoAssemblyDTO;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyTask;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VideoAssemblyCmdExecutor {
    private final VideoAssemblyGenerateAppService videoAssemblyGenerateAppService;
    public VideoAssemblyDTO generate(VideoAssemblyGenerateCmd cmd) {
        VideoAssemblyTask task = videoAssemblyGenerateAppService.generate(cmd.getBlueprintCode());
        return VideoAssemblyDTOConvertor.INSTANCE.convert(task);
    }
}
