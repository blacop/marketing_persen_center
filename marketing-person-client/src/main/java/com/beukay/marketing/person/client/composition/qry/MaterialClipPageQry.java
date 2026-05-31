package com.beukay.marketing.person.client.composition.qry;

import com.beukay.ai.common.entity.PageQuery;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;
import java.util.List;

/** 素材分页查询 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class MaterialClipPageQry extends PageQuery implements Serializable {

    private static final long serialVersionUID = 1L;

    /** VIDEO / IMAGE，可空 */
    private String kind;

    /** 文件名模糊匹配 */
    private String name;

    /** 标签 ID 列表（任意命中） */
    private List<Long> tagIds;

    /** MANUAL_UPLOAD / DECONSTRUCTION_AGENT，可空 */
    private String sourceType;

    /** 镜头类型 MaterialCategory 名称，可空；特殊值 "__UNCATEGORIZED__" 表示未分类 */
    private String category;
}
