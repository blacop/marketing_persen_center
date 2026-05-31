package com.beukay.marketing.person.dbsdk.composition.dao;

import com.beukay.marketing.person.dbsdk.composition.model.RenderJobDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RenderJobDOMapper {

    int insert(RenderJobDO entity);

    int update(RenderJobDO entity);

    RenderJobDO selectById(@Param("id") Long id);

    List<RenderJobDO> selectPage(@Param("projectId") Long projectId,
                                 @Param("status") String status,
                                 @Param("offset") long offset,
                                 @Param("limit") int limit);

    long countPage(@Param("projectId") Long projectId,
                   @Param("status") String status);
}
