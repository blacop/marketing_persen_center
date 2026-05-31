package com.beukay.marketing.person.client.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.cmd.SkillRegistryCreateCmd;
import com.beukay.marketing.person.client.dto.SkillRegistryDTO;
import com.beukay.marketing.person.client.qry.SkillRegistryDetailQry;
import com.beukay.marketing.person.client.qry.SkillRegistryPageQry;
import com.beukay.marketing.person.client.qry.SkillRegistryUniqueIdQry;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * SkillRegistry Feign API 接口
 */
public interface SkillRegistryFeign {

    @PostMapping("/skillRegistry/create")
    Result<Long> createSkillRegistry(@RequestBody @Valid SkillRegistryCreateCmd cmd);

    @PostMapping("/skillRegistry/get")
    Result<SkillRegistryDTO> getSkillRegistry(@RequestBody @Valid SkillRegistryDetailQry qry);

    @PostMapping("/skillRegistry/getBySkillId")
    Result<SkillRegistryDTO> getSkillRegistryBySkillId(@RequestBody @Valid SkillRegistryUniqueIdQry qry);

    @PostMapping("/skillRegistry/listPage")
    Result<PageInfo<SkillRegistryDTO>> listSkillRegistryPage(@RequestBody @Valid SkillRegistryPageQry qry);

}
