package com.beukay.marketing.person.domain.scriptBlueprint.gateway;

import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintSection;

import java.util.List;

public interface ScriptBlueprintSectionGateway {
    void batchCreate(List<ScriptBlueprintSection> sections);
    List<ScriptBlueprintSection> listByBlueprintCode(String blueprintCode);
}
