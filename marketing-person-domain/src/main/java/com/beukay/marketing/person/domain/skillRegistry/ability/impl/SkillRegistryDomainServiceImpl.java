package com.beukay.marketing.person.domain.skillRegistry.ability.impl;

import com.beukay.marketing.person.domain.skillRegistry.ability.SkillRegistryDomainService;
import com.beukay.marketing.person.domain.skillRegistry.gateway.SkillRegistryGateway;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 技能注册领域服务实现
 */
@Service
@RequiredArgsConstructor
public class SkillRegistryDomainServiceImpl implements SkillRegistryDomainService {

    private final SkillRegistryGateway skillRegistryGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(SkillRegistry skillRegistry) {
        return skillRegistryGateway.create(skillRegistry);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(SkillRegistry skillRegistry) {
        skillRegistryGateway.update(skillRegistry);
    }

    @Override
    public SkillRegistry queryById(Long id) {
        return skillRegistryGateway.queryById(id);
    }

    @Override
    public SkillRegistry queryBySkillId(String skillId) {
        return skillRegistryGateway.queryBySkillId(skillId);
    }

}
