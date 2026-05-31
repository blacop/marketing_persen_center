package com.beukay.marketing.person.dbsdk.composition.dao;

import com.beukay.marketing.person.dbsdk.composition.model.SourceVideoDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SourceVideoDOMapper {

    int insert(SourceVideoDO entity);

    SourceVideoDO selectById(@Param("id") Long id);

    List<SourceVideoDO> selectPage(@Param("status") String status,
                                   @Param("name") String name,
                                   @Param("offset") long offset,
                                   @Param("limit") int limit);

    long countPage(@Param("status") String status,
                   @Param("name") String name);

    int updateSegments(@Param("id") Long id, @Param("segmentsJson") String segmentsJson);

    int updateStatus(@Param("id") Long id, @Param("status") String status);

    int updateProbe(@Param("id") Long id,
                    @Param("durationMs") Long durationMs,
                    @Param("width") Integer width,
                    @Param("height") Integer height);

    int softDelete(@Param("id") Long id);
}
