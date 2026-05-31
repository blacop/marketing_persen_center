package com.beukay.marketing.person.domain.composition.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/** 素材标签（领域实体） */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class MaterialTag extends Entity<Long> {

    /** 标签名 */
    private String name;

    /** 类别：动机/手法/场景/其他 */
    private String category;

    /** UI 颜色 */
    private String color;

    /** 描述 */
    private String description;
}
