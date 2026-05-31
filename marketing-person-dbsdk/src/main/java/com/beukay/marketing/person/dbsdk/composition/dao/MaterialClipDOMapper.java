package com.beukay.marketing.person.dbsdk.composition.dao;

import com.beukay.marketing.person.dbsdk.composition.model.MaterialClipDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MaterialClipDOMapper {

    int insert(MaterialClipDO entity);

    MaterialClipDO selectById(@Param("id") Long id);

    MaterialClipDO selectBySha256(@Param("sha256") String sha256);

    /**
     * 分页查询。
     * @param kind        VIDEO/IMAGE 可空
     * @param name        模糊匹配可空
     * @param tagIds      命中任意 tag 即返回；空表示不过滤
     * @param sourceType  MANUAL_UPLOAD/DECONSTRUCTION_AGENT 可空
     * @param category    MaterialCategory 枚举值；特殊值 "__UNCATEGORIZED__" 表示未分类（NULL/空）
     * @param offset      偏移
     * @param limit       条数
     */
    List<MaterialClipDO> selectPage(@Param("kind") String kind,
                                    @Param("name") String name,
                                    @Param("tagIds") List<Long> tagIds,
                                    @Param("sourceType") String sourceType,
                                    @Param("category") String category,
                                    @Param("offset") long offset,
                                    @Param("limit") int limit);

    long countPage(@Param("kind") String kind,
                   @Param("name") String name,
                   @Param("tagIds") List<Long> tagIds,
                   @Param("sourceType") String sourceType,
                   @Param("category") String category);

    int updateTagsCache(@Param("id") Long id, @Param("tagsCache") String tagsCacheJson);

    int softDelete(@Param("id") Long id);
}
