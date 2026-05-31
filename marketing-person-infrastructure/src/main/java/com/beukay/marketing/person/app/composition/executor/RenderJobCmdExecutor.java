package com.beukay.marketing.person.app.composition.executor;

import com.beukay.marketing.person.app.composition.convertor.CompositionDTOConvertor;
import com.beukay.marketing.person.client.composition.cmd.SubmitRenderCmd;
import com.beukay.marketing.person.client.composition.dto.RenderJobDTO;
import com.beukay.marketing.person.domain.composition.ability.RenderJobService;
import com.beukay.marketing.person.domain.composition.model.RenderJob;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Log4j2
public class RenderJobCmdExecutor {

    private final RenderJobService renderJobService;

    public RenderJobDTO submit(Long projectId, SubmitRenderCmd cmd) {
        Integer count = cmd == null ? null : cmd.getCount();
        var config = (cmd == null || cmd.getRenderConfig() == null)
                ? null
                : CompositionDTOConvertor.INSTANCE.toRenderConfig(cmd.getRenderConfig());
        var hashes = cmd == null ? null : cmd.getSelectedPlanHashes();
        RenderJob job = renderJobService.submit(projectId, count, config, hashes);
        log.info("[render.submit] projectId={} jobId={} total={} cfg={} selected={}",
                projectId, job.getId(), job.getTotalCount(), job.getRenderConfig(),
                hashes == null ? null : hashes.size());
        return CompositionDTOConvertor.INSTANCE.toRenderJobDTO(job);
    }

    public void cancel(Long jobId) {
        renderJobService.cancel(jobId);
    }
}
