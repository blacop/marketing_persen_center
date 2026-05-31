package com.beukay.marketing.person.app.composition.executor;

import com.beukay.marketing.person.app.composition.convertor.CompositionDTOConvertor;
import com.beukay.marketing.person.client.composition.cmd.CreateMaterialClipCmd;
import com.beukay.marketing.person.client.composition.cmd.GenerateUploadSignatureCmd;
import com.beukay.marketing.person.client.composition.cmd.UpdateMaterialClipTagsCmd;
import com.beukay.marketing.person.client.composition.dto.MaterialClipDTO;
import com.beukay.marketing.person.client.composition.dto.UploadSignatureDTO;
import com.beukay.marketing.person.client.composition.enums.MaterialSourceType;
import com.beukay.marketing.person.domain.composition.ability.MaterialClipService;
import com.beukay.marketing.person.domain.composition.ability.UploadSignatureService;
import com.beukay.marketing.person.domain.composition.model.MaterialClip;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Log4j2
public class MaterialCmdExecutor {

    private final MaterialClipService materialClipService;
    private final UploadSignatureService uploadSignatureService;

    public UploadSignatureDTO generateUploadSignature(GenerateUploadSignatureCmd cmd) {
        UploadSignatureService.Result r = uploadSignatureService.issue(
                cmd.getBizType(), cmd.getFilename(), cmd.getSha256(), cmd.getContentType());
        return UploadSignatureDTO.builder()
                .ossKey(r.ossKey())
                .uploadUrl(r.uploadUrl())
                .accessUrl(r.accessUrl())
                .expiresInSeconds(r.expiresInSeconds())
                .build();
    }

    public MaterialClipDTO create(CreateMaterialClipCmd cmd) {
        String sourceType = cmd.getSourceType() == null ? MaterialSourceType.MANUAL_UPLOAD.name() : cmd.getSourceType();
        MaterialClip toCreate = MaterialClip.builder()
                .ossKey(cmd.getOssKey())
                .kind(cmd.getKind())
                .originalName(cmd.getOriginalName())
                .durationMs(cmd.getDurationMs())
                .width(cmd.getWidth())
                .height(cmd.getHeight())
                .fps(cmd.getFps())
                .bitrate(cmd.getBitrate())
                .fileSize(cmd.getFileSize())
                .sha256(cmd.getSha256())
                .sourceType(sourceType)
                .sourceExtra(cmd.getSourceExtra())
                .category(cmd.getCategory())
                .build();
        MaterialClip saved = materialClipService.create(toCreate, cmd.getTagIds());
        return CompositionDTOConvertor.INSTANCE.toMaterialClipDTO(saved);
    }

    public MaterialClipDTO updateTags(Long id, UpdateMaterialClipTagsCmd cmd) {
        MaterialClip updated = materialClipService.updateTags(id, cmd.getTagIds());
        return CompositionDTOConvertor.INSTANCE.toMaterialClipDTO(updated);
    }

    public void delete(Long id) {
        materialClipService.delete(id);
    }
}
