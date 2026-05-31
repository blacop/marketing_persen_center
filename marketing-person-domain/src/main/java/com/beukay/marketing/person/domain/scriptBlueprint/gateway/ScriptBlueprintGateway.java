package com.beukay.marketing.person.domain.scriptBlueprint.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprint;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintCriteria;

public interface ScriptBlueprintGateway {
    Long create(ScriptBlueprint blueprint);
    void update(ScriptBlueprint blueprint);
    ScriptBlueprint queryById(Long id);
    ScriptBlueprint queryByBlueprintCode(String blueprintCode);
    PageInfo<ScriptBlueprint> listByPage(ScriptBlueprintCriteria criteria);
}
