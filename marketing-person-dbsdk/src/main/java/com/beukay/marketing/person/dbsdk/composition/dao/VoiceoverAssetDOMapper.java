package com.beukay.marketing.person.dbsdk.composition.dao;

import com.beukay.marketing.person.dbsdk.composition.model.VoiceoverAssetDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface VoiceoverAssetDOMapper {

    int insert(VoiceoverAssetDO entity);

    VoiceoverAssetDO selectById(@Param("id") Long id);

    /**
     * @param category 可空；特殊值 "__UNCATEGORIZED__" 表示未分类（NULL/空）
     */
    List<VoiceoverAssetDO> selectPage(@Param("source") String source,
                                      @Param("text") String text,
                                      @Param("category") String category,
                                      @Param("offset") long offset,
                                      @Param("limit") int limit);

    long countPage(@Param("source") String source,
                   @Param("text") String text,
                   @Param("category") String category);

    int softDelete(@Param("id") Long id);
}
