package com.beukay.marketing.person.domain.composition.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/** 素材分类文件夹（取代 MaterialCategory 枚举的动态版本） */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class MaterialFolder extends Entity<Long> {

    private String code;
    private String name;
    private Integer sortNo;
    private String color;
    private String description;
    /** 参考音频 */
    private String refAudioOssKey;
    private Long refAudioDurationMs;
    private String refAudioFilename;
}
