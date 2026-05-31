package com.beukay.marketing.person.dbsdk.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.marketing.person.dbsdk.model.AgentIdentityDO;
import org.apache.ibatis.annotations.Param;

/**
 * 智能体身份 Mapper 接口
 */
public interface AgentIdentityDOMapper extends BaseMapper<AgentIdentityDO> {

    /**
     * 分页查询智能体身份
     */
    Page<AgentIdentityDO> listPage(@Param("name") String name,
                                   @Param("status") String status,
                                   @Param("agentType") String agentType,
                                   @Param("ownerId") String ownerId,
                                   @Param("page") IPage<AgentIdentityDO> page);

}
