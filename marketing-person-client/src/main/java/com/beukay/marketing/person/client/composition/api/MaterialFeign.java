package com.beukay.marketing.person.client.composition.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.composition.cmd.CreateMaterialClipCmd;
import com.beukay.marketing.person.client.composition.cmd.GenerateUploadSignatureCmd;
import com.beukay.marketing.person.client.composition.cmd.UpdateMaterialClipTagsCmd;
import com.beukay.marketing.person.client.composition.dto.MaterialClipDTO;
import com.beukay.marketing.person.client.composition.dto.UploadSignatureDTO;
import com.beukay.marketing.person.client.composition.qry.MaterialClipPageQry;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.cloud.openfeign.SpringQueryMap;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

/** 素材 API */
@FeignClient(name = "marketing-person-center", contextId = "materialFeign")
public interface MaterialFeign {

    /** 申请 OSS 直传签名 */
    @PostMapping("/api/materials/upload-signature")
    Result<UploadSignatureDTO> generateUploadSignature(@Valid @RequestBody GenerateUploadSignatureCmd cmd);

    /** 元数据入库（OSS 直传完成后调用） */
    @PostMapping("/api/materials")
    Result<MaterialClipDTO> create(@Valid @RequestBody CreateMaterialClipCmd cmd);

    /** 分页查询素材 */
    @GetMapping("/api/materials")
    Result<PageInfo<MaterialClipDTO>> page(@SpringQueryMap @Valid MaterialClipPageQry qry);

    /** 详情 */
    @GetMapping("/api/materials/{id}")
    Result<MaterialClipDTO> getById(@PathVariable("id") Long id);

    /** 修改标签 */
    @PutMapping("/api/materials/{id}/tags")
    Result<MaterialClipDTO> updateTags(@PathVariable("id") Long id,
                                       @Valid @RequestBody UpdateMaterialClipTagsCmd cmd);

    /** 软删除 */
    @DeleteMapping("/api/materials/{id}")
    Result<Void> delete(@PathVariable("id") Long id);
}
