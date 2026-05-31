package com.beukay.marketing.person.domain.composition.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

/** 素材片段（领域实体） */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class MaterialClip extends Entity<Long> {

    /** OSS 对象 key */
    private String ossKey;

    /** VIDEO / IMAGE */
    private String kind;

    private String originalName;
    private Long durationMs;
    private Integer width;
    private Integer height;
    private Double fps;
    private Long bitrate;
    private Long fileSize;

    /** 内容 sha256，用于自然去重 */
    private String sha256;

    /** MANUAL_UPLOAD / DECONSTRUCTION_AGENT */
    private String sourceType;

    /** 来源附加信息（JSON 字符串） */
    private String sourceExtra;

    /** 镜头类型 MaterialCategory，一对一分类（与 tags N:M 互补） */
    private String category;

    /**
     * 标签缓存——业务读路径友好。
     * 持久化时写入 tags_cache JSON 列；与 material_clip_tag 关联表保持最终一致。
     */
    private List<MaterialTag> tags;
}
