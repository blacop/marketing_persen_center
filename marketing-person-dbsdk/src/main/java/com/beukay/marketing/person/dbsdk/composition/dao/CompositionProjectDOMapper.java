package com.beukay.marketing.person.dbsdk.composition.dao;

import com.beukay.marketing.person.dbsdk.composition.model.CompositionProjectDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CompositionProjectDOMapper {

    int insert(CompositionProjectDO entity);

    int update(CompositionProjectDO entity);

    CompositionProjectDO selectById(@Param("id") Long id);

    List<CompositionProjectDO> selectPage(@Param("mode") String mode,
                                          @Param("status") String status,
                                          @Param("name") String name,
                                          @Param("chapterSource") String chapterSource,
                                          @Param("offset") long offset,
                                          @Param("limit") int limit);

    long countPage(@Param("mode") String mode,
                   @Param("status") String status,
                   @Param("name") String name,
                   @Param("chapterSource") String chapterSource);

    int softDelete(@Param("id") Long id);
}
