package com.beukay.marketing.person.dbsdk.composition.dao;

import com.beukay.marketing.person.dbsdk.composition.model.MaterialClipTagDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MaterialClipTagDOMapper {

    int batchInsert(@Param("list") List<MaterialClipTagDO> list);

    /** 软删 clip 当前所有标签关联 */
    int softDeleteByClipId(@Param("clipId") Long clipId);

    List<Long> selectTagIdsByClipId(@Param("clipId") Long clipId);
}
