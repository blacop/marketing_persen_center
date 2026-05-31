package com.beukay.marketing.person.dbsdk.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.marketing.person.dbsdk.model.AgentPublishRecordDO;
import org.apache.ibatis.annotations.Param;

/**
 * AgentPublishRecord Mapper
 */
public interface AgentPublishRecordDOMapper extends BaseMapper<AgentPublishRecordDO> {

    /**
     * 分页查询
     */
    Page<AgentPublishRecordDO> listPage(@Param("definitionId") Long definitionId,
                                        @Param("publishStatus") String publishStatus,
                                        @Param("page") IPage<AgentPublishRecordDO> page);

}
