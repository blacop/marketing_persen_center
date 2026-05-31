package com.beukay.marketing.person.app.composition.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.composition.executor.VoiceoverCmdExecutor;
import com.beukay.marketing.person.app.composition.executor.VoiceoverQryExecutor;
import com.beukay.marketing.person.client.composition.api.VoiceoverFeign;
import com.beukay.marketing.person.client.composition.cmd.CreateVoiceoverAssetCmd;
import com.beukay.marketing.person.client.composition.dto.VoiceoverAssetDTO;
import com.beukay.marketing.person.client.composition.qry.VoiceoverAssetPageQry;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Log4j2
public class VoiceoverController implements VoiceoverFeign {

    private final VoiceoverCmdExecutor voiceoverCmdExecutor;
    private final VoiceoverQryExecutor voiceoverQryExecutor;

    @Override
    public Result<VoiceoverAssetDTO> create(CreateVoiceoverAssetCmd cmd) {
        log.info("[voiceover.create] ossKey={} source={}", cmd.getOssKey(), cmd.getSource());
        return Result.success(voiceoverCmdExecutor.create(cmd));
    }

    @Override
    public Result<PageInfo<VoiceoverAssetDTO>> page(VoiceoverAssetPageQry qry) {
        return Result.success(voiceoverQryExecutor.page(qry));
    }

    @Override
    public Result<VoiceoverAssetDTO> getById(Long id) {
        return Result.success(voiceoverQryExecutor.getById(id));
    }

    @Override
    public Result<Void> delete(Long id) {
        voiceoverCmdExecutor.delete(id);
        return Result.success(null);
    }
}
