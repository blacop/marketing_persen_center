package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.app.convertor.SkillRegistryDTOConvertor;
import com.beukay.marketing.person.client.dto.SkillRegistryDTO;
import com.beukay.marketing.person.domain.skillRegistry.gateway.SkillRegistryGateway;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import com.beukay.ai.common.exception.GenericBusinessException;
@Log4j2
@Component
@RequiredArgsConstructor
public class SkillRegistryDetailQryExecutor {

    private final SkillRegistryGateway skillRegistryGateway;

    public SkillRegistryDTO getSkillRegistry(Long id) {
        SkillRegistry skillRegistry = skillRegistryGateway.queryById(id);
        if (skillRegistry == null) {
            throw new GenericBusinessException("SkillRegistry不存在: " + id);
        }
        return SkillRegistryDTOConvertor.INSTANCE.convert(skillRegistry);
    }

    public SkillRegistryDTO getBySkillId(String skillId) {
        SkillRegistry skillRegistry = skillRegistryGateway.queryBySkillId(skillId);
        if (skillRegistry == null) {
            throw new GenericBusinessException("SkillRegistry不存在, skillId=" + skillId);
        }
        return SkillRegistryDTOConvertor.INSTANCE.convert(skillRegistry);
    }

}
