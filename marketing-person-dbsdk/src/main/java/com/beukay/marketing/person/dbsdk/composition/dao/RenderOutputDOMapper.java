package com.beukay.marketing.person.dbsdk.composition.dao;

import com.beukay.marketing.person.dbsdk.composition.model.RenderOutputDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RenderOutputDOMapper {

    int insert(RenderOutputDO entity);

    int update(RenderOutputDO entity);

    RenderOutputDO selectById(@Param("id") Long id);

    List<RenderOutputDO> selectByJobId(@Param("jobId") Long jobId);
}
