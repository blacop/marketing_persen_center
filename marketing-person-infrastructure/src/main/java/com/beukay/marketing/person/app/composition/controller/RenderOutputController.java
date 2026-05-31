package com.beukay.marketing.person.app.composition.controller;

import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.composition.api.RenderOutputFeign;
import com.beukay.marketing.person.client.composition.dto.UploadSignatureDTO;
import com.beukay.marketing.person.domain.composition.gateway.ObjectStorageGateway;
import com.beukay.marketing.person.domain.composition.gateway.RenderOutputGateway;
import com.beukay.marketing.person.domain.composition.model.RenderOutput;
import com.beukay.marketing.person.infrastructure.composition.oss.OssProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

import com.beukay.ai.common.exception.GenericBusinessException;
@RestController
@RequiredArgsConstructor
public class RenderOutputController implements RenderOutputFeign {

    private final RenderOutputGateway renderOutputGateway;
    private final ObjectStorageGateway objectStorageGateway;
    private final OssProperties ossProperties;

    @Override
    public Result<UploadSignatureDTO> signedUrl(Long id) {
        RenderOutput out = renderOutputGateway.findById(id);
        if (out == null || out.getOssKey() == null) {
            throw new GenericBusinessException("output not ready: " + id);
        }
        Duration ttl = Duration.ofSeconds(ossProperties.getDownloadSignatureTtlSeconds());
        String url = objectStorageGateway.publicOrSignedUrl(out.getOssKey(), ttl);
        return Result.success(UploadSignatureDTO.builder()
                .ossKey(out.getOssKey())
                .accessUrl(url)
                .expiresInSeconds(ttl.getSeconds())
                .build());
    }
}
