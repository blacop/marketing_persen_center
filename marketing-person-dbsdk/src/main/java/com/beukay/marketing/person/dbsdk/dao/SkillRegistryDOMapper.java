package com.beukay.marketing.person.dbsdk.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.marketing.person.dbsdk.model.SkillRegistryDO;
import org.apache.ibatis.annotations.Param;

/**
 * 技能注册 Mapper 接口
 */
public interface SkillRegistryDOMapper extends BaseMapper<SkillRegistryDO> {

    /**
     * 分页查询技能注册
     */
    Page<SkillRegistryDO> listPage(@Param("name") String name,
                                   @Param("status") String status,
                                   @Param("category") String category,
                                   @Param("source") String source,
                                   @Param("page") IPage<SkillRegistryDO> page);

}
