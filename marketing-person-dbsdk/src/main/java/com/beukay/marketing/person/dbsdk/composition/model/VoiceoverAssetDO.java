package com.beukay.marketing.person.dbsdk.composition.model;

import lombok.Data;

import java.time.LocalDateTime;

/** voiceover_asset 表 */
@Data
public class VoiceoverAssetDO {

    private Long id;

    private String ossKey;
    private String source;
    private String textContent;
    private String voiceCode;
    private Double speed;
    private Long durationMs;
    private Long fileSize;
    private String format;
    /** 镜头类型枚举 MaterialCategory（与素材共用） */
    private String category;

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
