package com.beukay.marketing.person.domain.scriptBlueprint.ability.impl;

import com.beukay.marketing.person.domain.scriptBlueprint.ability.ScriptBlueprintDomainService;
import com.beukay.marketing.person.domain.scriptBlueprint.gateway.ScriptBlueprintGateway;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprint;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScriptBlueprintDomainServiceImpl implements ScriptBlueprintDomainService {

    private final ScriptBlueprintGateway scriptBlueprintGateway;

    @Override
    public Long create(ScriptBlueprint blueprint) {
        return scriptBlueprintGateway.create(blueprint);
    }

    @Override
    public void update(ScriptBlueprint blueprint) {
        scriptBlueprintGateway.update(blueprint);
    }

    @Override
    public ScriptBlueprint queryById(Long id) {
        return scriptBlueprintGateway.queryById(id);
    }

    @Override
    public ScriptBlueprint queryByBlueprintCode(String blueprintCode) {
        return scriptBlueprintGateway.queryByBlueprintCode(blueprintCode);
    }
}
