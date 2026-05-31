package com.beukay.marketing.person.app.composition.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.composition.executor.MaterialCmdExecutor;
import com.beukay.marketing.person.app.composition.executor.MaterialQryExecutor;
import com.beukay.marketing.person.client.composition.api.MaterialFeign;
import com.beukay.marketing.person.client.composition.cmd.CreateMaterialClipCmd;
import com.beukay.marketing.person.client.composition.cmd.GenerateUploadSignatureCmd;
import com.beukay.marketing.person.client.composition.cmd.UpdateMaterialClipTagsCmd;
import com.beukay.marketing.person.client.composition.dto.MaterialClipDTO;
import com.beukay.marketing.person.client.composition.dto.UploadSignatureDTO;
import com.beukay.marketing.person.client.composition.qry.MaterialClipPageQry;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Log4j2
public class MaterialController implements MaterialFeign {

    private final MaterialCmdExecutor materialCmdExecutor;
    private final MaterialQryExecutor materialQryExecutor;

    @Override
    public Result<UploadSignatureDTO> generateUploadSignature(GenerateUploadSignatureCmd cmd) {
        return Result.success(materialCmdExecutor.generateUploadSignature(cmd));
    }

    @Override
    public Result<MaterialClipDTO> create(CreateMaterialClipCmd cmd) {
        log.info("[material.create] ossKey={} kind={} sha256={} source={}",
                cmd.getOssKey(), cmd.getKind(), cmd.getSha256(), cmd.getSourceType());
        return Result.success(materialCmdExecutor.create(cmd));
    }

    @Override
    public Result<PageInfo<MaterialClipDTO>> page(MaterialClipPageQry qry) {
        return Result.success(materialQryExecutor.page(qry));
    }

    @Override
    public Result<MaterialClipDTO> getById(Long id) {
        return Result.success(materialQryExecutor.getById(id));
    }

    @Override
    public Result<MaterialClipDTO> updateTags(Long id, UpdateMaterialClipTagsCmd cmd) {
        return Result.success(materialCmdExecutor.updateTags(id, cmd));
    }

    @Override
    public Result<Void> delete(Long id) {
        materialCmdExecutor.delete(id);
        return Result.success(null);
    }
}
