package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.app.convertor.ScriptBlueprintDTOConvertor;
import com.beukay.marketing.person.app.service.ScriptBlueprintGenerateAppService;
import com.beukay.marketing.person.client.cmd.ScriptBlueprintGenerateCmd;
import com.beukay.marketing.person.client.dto.ScriptBlueprintDTO;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprint;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScriptBlueprintCmdExecutor {

    private final ScriptBlueprintGenerateAppService scriptBlueprintGenerateAppService;

    public ScriptBlueprintDTO generate(ScriptBlueprintGenerateCmd cmd) {
        ScriptBlueprint blueprint = scriptBlueprintGenerateAppService.generate(
                cmd.getSkuId(),
                cmd.getMarketingGoal(),
                cmd.getMarketingNode(),
                cmd.getTargetAudience(),
                cmd.getPlatform(),
                cmd.getAccountId());
        return ScriptBlueprintDTOConvertor.INSTANCE.convert(blueprint);
    }
}
