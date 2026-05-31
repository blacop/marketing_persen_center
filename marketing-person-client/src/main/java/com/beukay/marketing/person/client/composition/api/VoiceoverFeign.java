package com.beukay.marketing.person.client.composition.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.composition.cmd.CreateVoiceoverAssetCmd;
import com.beukay.marketing.person.client.composition.dto.VoiceoverAssetDTO;
import com.beukay.marketing.person.client.composition.qry.VoiceoverAssetPageQry;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.cloud.openfeign.SpringQueryMap;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/** 配音 API */
@FeignClient(name = "marketing-person-center", contextId = "voiceoverFeign")
public interface VoiceoverFeign {

    /** 元数据入库（OSS 直传完成后调用） */
    @PostMapping("/api/voiceovers")
    Result<VoiceoverAssetDTO> create(@Valid @RequestBody CreateVoiceoverAssetCmd cmd);

    /** 分页查询 */
    @GetMapping("/api/voiceovers")
    Result<PageInfo<VoiceoverAssetDTO>> page(@SpringQueryMap @Valid VoiceoverAssetPageQry qry);

    /** 详情 */
    @GetMapping("/api/voiceovers/{id}")
    Result<VoiceoverAssetDTO> getById(@PathVariable("id") Long id);

    /** 软删除 */
    @DeleteMapping("/api/voiceovers/{id}")
    Result<Void> delete(@PathVariable("id") Long id);
}
