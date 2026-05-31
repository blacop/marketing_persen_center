package com.beukay.marketing.person.app.composition.controller;

import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.composition.executor.MaterialTagCmdExecutor;
import com.beukay.marketing.person.app.composition.executor.MaterialTagQryExecutor;
import com.beukay.marketing.person.client.composition.api.MaterialTagFeign;
import com.beukay.marketing.person.client.composition.cmd.CreateMaterialTagCmd;
import com.beukay.marketing.person.client.composition.dto.MaterialTagDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Log4j2
public class MaterialTagController implements MaterialTagFeign {

    private final MaterialTagCmdExecutor materialTagCmdExecutor;
    private final MaterialTagQryExecutor materialTagQryExecutor;

    @Override
    public Result<List<MaterialTagDTO>> list(String category) {
        return Result.success(materialTagQryExecutor.list(category));
    }

    @Override
    public Result<MaterialTagDTO> create(CreateMaterialTagCmd cmd) {
        return Result.success(materialTagCmdExecutor.create(cmd));
    }

    @Override
    public Result<Void> delete(Long id) {
        materialTagCmdExecutor.delete(id);
        return Result.success(null);
    }
}
