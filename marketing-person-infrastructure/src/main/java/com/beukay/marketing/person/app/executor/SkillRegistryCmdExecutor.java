package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.Operator;
import com.beukay.marketing.person.client.cmd.SkillRegistryCreateCmd;
import com.beukay.marketing.person.domain.skillRegistry.ability.SkillRegistryDomainService;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import com.beukay.ai.common.exception.GenericBusinessException;
@Log4j2
@Component
@RequiredArgsConstructor
public class SkillRegistryCmdExecutor {

    private static final Operator SYSTEM_OPERATOR = new Operator(0L, "system");

    private final SkillRegistryDomainService skillRegistryDomainService;

    public Long createSkillRegistry(SkillRegistryCreateCmd cmd) {
        SkillRegistry existing = skillRegistryDomainService.queryBySkillId(cmd.getSkillId());
        if (existing != null) {
            throw new GenericBusinessException("skillId已存在: " + cmd.getSkillId());
        }
        SkillRegistry skillRegistry = SkillRegistry.builder()
                .name(cmd.getName())
                .description(cmd.getDescription())
                .status(cmd.getStatus() == null || cmd.getStatus().isBlank() ? "ACTIVE" : cmd.getStatus())
                .skillId(cmd.getSkillId())
                .category(cmd.getCategory())
                .source(cmd.getSource())
                .mcpEndpoint(cmd.getMcpEndpoint())
                .inputSchema(cmd.getInputSchema())
                .trustLevel(cmd.getTrustLevel())
                .version(cmd.getVersion())
                .build();
        skillRegistry.buildInsert(SYSTEM_OPERATOR);
        return skillRegistryDomainService.create(skillRegistry);
    }

}
