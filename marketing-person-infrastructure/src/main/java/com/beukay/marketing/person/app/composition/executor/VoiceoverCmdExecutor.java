package com.beukay.marketing.person.app.composition.executor;

import com.beukay.marketing.person.app.composition.convertor.CompositionDTOConvertor;
import com.beukay.marketing.person.client.composition.cmd.CreateVoiceoverAssetCmd;
import com.beukay.marketing.person.client.composition.dto.VoiceoverAssetDTO;
import com.beukay.marketing.person.client.composition.enums.VoiceoverSource;
import com.beukay.marketing.person.domain.composition.ability.VoiceoverAssetService;
import com.beukay.marketing.person.domain.composition.model.VoiceoverAsset;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VoiceoverCmdExecutor {

    private final VoiceoverAssetService voiceoverAssetService;

    public VoiceoverAssetDTO create(CreateVoiceoverAssetCmd cmd) {
        String source = cmd.getSource() == null ? VoiceoverSource.UPLOAD.name() : cmd.getSource();
        VoiceoverAsset asset = VoiceoverAsset.builder()
                .ossKey(cmd.getOssKey())
                .source(source)
                .textContent(cmd.getTextContent())
                .voiceCode(cmd.getVoiceCode())
                .speed(cmd.getSpeed())
                .durationMs(cmd.getDurationMs())
                .fileSize(cmd.getFileSize())
                .format(cmd.getFormat())
                .category(cmd.getCategory())
                .build();
        return CompositionDTOConvertor.INSTANCE.toVoiceoverDTO(voiceoverAssetService.create(asset));
    }

    public void delete(Long id) {
        voiceoverAssetService.delete(id);
    }
}
