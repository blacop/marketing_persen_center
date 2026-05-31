package com.beukay.marketing.person.domain.skillRegistry.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistry;
import com.beukay.marketing.person.domain.skillRegistry.model.SkillRegistryListCriteriaQuery;

/**
 * 技能注册 Gateway 接口
 */
public interface SkillRegistryGateway {

    /**
     * 创建技能注册
     */
    Long create(SkillRegistry skillRegistry);

    /**
     * 更新技能注册
     */
    void update(SkillRegistry skillRegistry);

    /**
     * 根据ID查询
     */
    SkillRegistry queryById(Long id);

    /**
     * 根据技能唯一标识查询
     */
    SkillRegistry queryBySkillId(String skillId);

    /**
     * 分页查询
     */
    PageInfo<SkillRegistry> listPage(SkillRegistryListCriteriaQuery criteriaQuery, PageQuery pageQuery);

}
