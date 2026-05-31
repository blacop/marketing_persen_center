package com.beukay.marketing.person.client.composition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/** 素材标签 DTO */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialTagDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    /** 类别：动机 / 手法 / 场景 / 其他 */
    private String category;
    /** UI 颜色，如 #FF0000 */
    private String color;
    private String description;
}
