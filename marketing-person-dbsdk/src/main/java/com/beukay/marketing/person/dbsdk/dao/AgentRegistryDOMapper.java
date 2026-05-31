package com.beukay.marketing.person.dbsdk.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.marketing.person.dbsdk.model.AgentRegistryDO;
import org.apache.ibatis.annotations.Param;

/**
 * AgentRegistry Mapper
 */
public interface AgentRegistryDOMapper extends BaseMapper<AgentRegistryDO> {

    /**
     * 分页查询
     */
    Page<AgentRegistryDO> listPage(@Param("name") String name,
                                   @Param("status") String status,
                                   @Param("category") String category,
                                   @Param("agentType") String agentType,
                                   @Param("page") IPage<AgentRegistryDO> page);

}
