package com.beukay.marketing.person.dbsdk.composition.dao;

import com.beukay.marketing.person.dbsdk.composition.model.MaterialFolderDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MaterialFolderDOMapper {

    int insert(MaterialFolderDO entity);

    MaterialFolderDO selectById(@Param("id") Long id);

    MaterialFolderDO selectByCode(@Param("code") String code);

    List<MaterialFolderDO> selectAll();

    int update(MaterialFolderDO entity);

    int softDelete(@Param("id") Long id);
}
