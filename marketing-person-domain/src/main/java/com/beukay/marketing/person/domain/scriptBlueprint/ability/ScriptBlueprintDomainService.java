package com.beukay.marketing.person.domain.scriptBlueprint.ability;

import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprint;

public interface ScriptBlueprintDomainService {
    Long create(ScriptBlueprint blueprint);
    void update(ScriptBlueprint blueprint);
    ScriptBlueprint queryById(Long id);
    ScriptBlueprint queryByBlueprintCode(String blueprintCode);
}
