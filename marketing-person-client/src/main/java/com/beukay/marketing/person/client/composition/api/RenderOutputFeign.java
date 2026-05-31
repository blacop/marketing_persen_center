package com.beukay.marketing.person.client.composition.api;

import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.composition.dto.UploadSignatureDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "marketing-person-center", contextId = "renderOutputFeign")
public interface RenderOutputFeign {

    /** 拿成片下载/播放签名 URL */
    @GetMapping("/api/render-outputs/{id}/signed-url")
    Result<UploadSignatureDTO> signedUrl(@PathVariable("id") Long id);
}
