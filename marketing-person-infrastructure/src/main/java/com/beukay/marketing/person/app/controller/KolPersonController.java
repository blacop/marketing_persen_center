package com.beukay.marketing.person.app.controller;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.executor.KolPersonCmdExecutor;
import com.beukay.marketing.person.app.executor.KolPersonQryExecutor;
import com.beukay.marketing.person.client.api.KolPersonFeign;
import com.beukay.marketing.person.client.cmd.KolPersonCreateCmd;
import com.beukay.marketing.person.client.dto.KolPersonDTO;
import com.beukay.marketing.person.client.qry.KolPersonPageQry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

/**
 * KolPerson Controller
 */
@RestController
@RequiredArgsConstructor
public class KolPersonController implements KolPersonFeign {

    private final KolPersonCmdExecutor kolPersonCmdExecutor;
    private final KolPersonQryExecutor kolPersonQryExecutor;

    @Override
    public Result<Long> createKolPerson(KolPersonCreateCmd cmd) {
        return Result.success(kolPersonCmdExecutor.createKolPerson(cmd));
    }

    @Override
    public Result<PageInfo<KolPersonDTO>> listKolPersonPage(KolPersonPageQry qry) {
        return Result.success(kolPersonQryExecutor.listKolPersonPage(qry));
    }

}
