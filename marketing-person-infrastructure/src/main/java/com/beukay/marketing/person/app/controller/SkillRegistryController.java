package com.beukay.marketing.person.app.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.executor.SkillRegistryCmdExecutor;
import com.beukay.marketing.person.app.executor.SkillRegistryDetailQryExecutor;
import com.beukay.marketing.person.app.executor.SkillRegistryQryExecutor;
import com.beukay.marketing.person.client.api.SkillRegistryFeign;
import com.beukay.marketing.person.client.cmd.SkillRegistryCreateCmd;
import com.beukay.marketing.person.client.dto.SkillRegistryDTO;
import com.beukay.marketing.person.client.qry.SkillRegistryDetailQry;
import com.beukay.marketing.person.client.qry.SkillRegistryPageQry;
import com.beukay.marketing.person.client.qry.SkillRegistryUniqueIdQry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SkillRegistryController implements SkillRegistryFeign {

    private final SkillRegistryCmdExecutor skillRegistryCmdExecutor;
    private final SkillRegistryQryExecutor skillRegistryQryExecutor;
    private final SkillRegistryDetailQryExecutor skillRegistryDetailQryExecutor;

    @Override
    public Result<Long> createSkillRegistry(SkillRegistryCreateCmd cmd) {
        return Result.success(skillRegistryCmdExecutor.createSkillRegistry(cmd));
    }

    @Override
    public Result<SkillRegistryDTO> getSkillRegistry(SkillRegistryDetailQry qry) {
        return Result.success(skillRegistryDetailQryExecutor.getSkillRegistry(qry.getId()));
    }

    @Override
    public Result<SkillRegistryDTO> getSkillRegistryBySkillId(SkillRegistryUniqueIdQry qry) {
        return Result.success(skillRegistryDetailQryExecutor.getBySkillId(qry.getSkillId()));
    }

    @Override
    public Result<PageInfo<SkillRegistryDTO>> listSkillRegistryPage(SkillRegistryPageQry qry) {
        return Result.success(skillRegistryQryExecutor.listSkillRegistryPage(qry));
    }

}
