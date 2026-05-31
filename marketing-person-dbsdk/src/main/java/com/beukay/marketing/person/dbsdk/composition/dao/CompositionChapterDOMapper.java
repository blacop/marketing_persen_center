package com.beukay.marketing.person.dbsdk.composition.dao;

import com.beukay.marketing.person.dbsdk.composition.model.CompositionChapterDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CompositionChapterDOMapper {

    int batchInsert(@Param("list") List<CompositionChapterDO> list);

    int update(CompositionChapterDO entity);

    List<CompositionChapterDO> selectByProjectId(@Param("projectId") Long projectId);

    /** 软删除一个 project 下不在 keepIds 集合内的章节 */
    int softDeleteNotIn(@Param("projectId") Long projectId,
                        @Param("keepIds") List<Long> keepIds);

    int softDeleteByProjectId(@Param("projectId") Long projectId);
}
