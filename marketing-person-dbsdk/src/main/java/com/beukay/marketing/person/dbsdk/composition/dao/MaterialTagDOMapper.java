package com.beukay.marketing.person.dbsdk.composition.dao;

import com.beukay.marketing.person.dbsdk.composition.model.MaterialTagDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MaterialTagDOMapper {

    int insert(MaterialTagDO entity);

    MaterialTagDO selectById(@Param("id") Long id);

    MaterialTagDO selectByNameAndCategory(@Param("name") String name,
                                          @Param("category") String category);

    List<MaterialTagDO> selectByIds(@Param("ids") List<Long> ids);

    List<MaterialTagDO> selectAll(@Param("category") String category);

    int softDelete(@Param("id") Long id);
}
