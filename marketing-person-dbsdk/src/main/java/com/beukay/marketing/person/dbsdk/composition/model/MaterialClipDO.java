package com.beukay.marketing.person.dbsdk.composition.model;

import lombok.Data;

import java.time.LocalDateTime;

/** material_clip 表 */
@Data
public class MaterialClipDO {

    private Long id;

    private String ossKey;
    private String kind;
    private String originalName;
    private Long durationMs;
    private Integer width;
    private Integer height;
    private Double fps;
    private Long bitrate;
    private Long fileSize;
    private String sha256;
    private String sourceType;
    /** JSON 字符串 */
    private String sourceExtra;
    /** 镜头类型枚举 MaterialCategory；一对一分类，区别于 material_tag 的 N:M 标签 */
    private String category;
    /** JSON 字符串 */
    private String tagsCache;

    /** 八字段 */
    private String nezhaTenantCode;
    private Boolean isDeleted;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
}
