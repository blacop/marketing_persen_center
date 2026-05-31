package com.beukay.marketing.person.domain.skillRegistry.ability;

import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistry;

/**
 * 技能注册领域服务接口
 */
public interface SkillRegistryDomainService {

    /**
     * 创建技能注册
     */
    Long create(SkillRegistry skillRegistry);

    /**
     * 更新技能注册
     */
    void update(SkillRegistry skillRegistry);

    /**
     * 根据ID查询技能注册
     */
    SkillRegistry queryById(Long id);

    /**
     * 根据技能唯一标识查询
     */
    SkillRegistry queryBySkillId(String skillId);

}
