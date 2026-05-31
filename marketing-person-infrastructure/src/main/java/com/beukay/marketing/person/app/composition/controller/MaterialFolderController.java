package com.beukay.marketing.person.app.composition.controller;

import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.composition.executor.MaterialFolderCmdExecutor;
import com.beukay.marketing.person.app.composition.executor.MaterialFolderQryExecutor;
import com.beukay.marketing.person.client.composition.api.MaterialFolderFeign;
import com.beukay.marketing.person.client.composition.cmd.CreateMaterialFolderCmd;
import com.beukay.marketing.person.client.composition.cmd.UpdateMaterialFolderCmd;
import com.beukay.marketing.person.client.composition.dto.MaterialFolderDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MaterialFolderController implements MaterialFolderFeign {

    private final MaterialFolderCmdExecutor cmdExecutor;
    private final MaterialFolderQryExecutor qryExecutor;

    @Override
    public Result<List<MaterialFolderDTO>> list() {
        return Result.success(qryExecutor.listAll());
    }

    @Override
    public Result<MaterialFolderDTO> create(CreateMaterialFolderCmd cmd) {
        return Result.success(cmdExecutor.create(cmd));
    }

    @Override
    public Result<MaterialFolderDTO> update(Long id, UpdateMaterialFolderCmd cmd) {
        return Result.success(cmdExecutor.update(id, cmd));
    }

    @Override
    public Result<Void> delete(Long id) {
        cmdExecutor.delete(id);
        return Result.success(null);
    }

}
