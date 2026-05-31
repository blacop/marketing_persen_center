package com.beukay.marketing.person.client.qry;

import com.beukay.ai.common.entity.PageQuery;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 技能注册分页查询
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillRegistryPageQry implements Serializable {

    private static final long serialVersionUID = 1L;

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

    /**
     * 分页信息
     */
    @Valid
    private PageQuery pageQuery;

}
