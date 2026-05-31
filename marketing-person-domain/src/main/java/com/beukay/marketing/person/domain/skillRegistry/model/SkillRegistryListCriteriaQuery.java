package com.beukay.marketing.person.domain.skillRegistry.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 技能注册查询条件
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillRegistryListCriteriaQuery {

    /**
     * 名称
     */
    private String name;

    /**
     * 状态
     */
    private String status;

    /**
     * 技能分类
     */
    private String category;

    /**
     * 来源(BUILTIN/LOCAL/HUB/MCP)
     */
    private String source;

}
