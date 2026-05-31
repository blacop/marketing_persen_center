package com.beukay.marketing.person.dbsdk.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.marketing.person.dbsdk.model.AgentDefinitionDO;
import org.apache.ibatis.annotations.Param;

/**
 * AgentDefinition Mapper
 */
public interface AgentDefinitionDOMapper extends BaseMapper<AgentDefinitionDO> {

    /**
     * 分页查询
     */
    Page<AgentDefinitionDO> listPage(@Param("name") String name,
                                     @Param("status") String status,
                                     @Param("publishStatus") String publishStatus,
                                     @Param("page") IPage<AgentDefinitionDO> page);

}
