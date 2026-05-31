package com.beukay.marketing.person.client.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.cmd.KolPersonCreateCmd;
import com.beukay.marketing.person.client.dto.KolPersonDTO;
import com.beukay.marketing.person.client.qry.KolPersonPageQry;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * KolPerson Feign API
 */
public interface KolPersonFeign {

    @PostMapping("/kolPerson/create")
    Result<Long> createKolPerson(@RequestBody @Valid KolPersonCreateCmd cmd);

    @PostMapping("/kolPerson/listPage")
    Result<PageInfo<KolPersonDTO>> listKolPersonPage(@RequestBody @Valid KolPersonPageQry qry);

}
