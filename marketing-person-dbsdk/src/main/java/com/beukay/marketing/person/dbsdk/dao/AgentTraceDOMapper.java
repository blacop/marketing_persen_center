package com.beukay.marketing.person.dbsdk.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.marketing.person.dbsdk.model.AgentTraceDO;
import org.apache.ibatis.annotations.Param;

/**
 * AgentTrace Mapper
 */
public interface AgentTraceDOMapper extends BaseMapper<AgentTraceDO> {

    /**
     * 分页查询
     */
    Page<AgentTraceDO> listPage(@Param("name") String name,
                                @Param("status") String status,
                                @Param("agentId") String agentId,
                                @Param("traceType") String traceType,
                                @Param("traceStatus") String traceStatus,
                                @Param("definitionId") Long definitionId,
                                @Param("page") IPage<AgentTraceDO> page);

}
