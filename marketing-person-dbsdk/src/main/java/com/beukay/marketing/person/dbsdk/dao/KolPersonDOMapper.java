package com.beukay.marketing.person.dbsdk.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beukay.marketing.person.dbsdk.model.KolPersonDO;
import org.apache.ibatis.annotations.Param;

/**
 * KolPerson Mapper
 */
public interface KolPersonDOMapper extends BaseMapper<KolPersonDO> {

    /**
     * 分页查询
     */
    Page<KolPersonDO> listPage(@Param("name") String name,
                               @Param("status") String status,
                               @Param("page") IPage<KolPersonDO> page);

}
