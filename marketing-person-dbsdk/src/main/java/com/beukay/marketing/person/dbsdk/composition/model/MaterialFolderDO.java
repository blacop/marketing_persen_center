package com.beukay.marketing.person.dbsdk.composition.model;

import lombok.Data;

import java.time.LocalDateTime;

/** material_folder 表 */
@Data
public class MaterialFolderDO {

    private Long id;

    /** 稳定标识，与 material_clip.category 等字段对齐 */
    private String code;

    private String name;

    private Integer sortNo;

    private String color;

    private String description;

    /** 参考音频（每个 folder 可选绑定一个示例音频） */
    private String refAudioOssKey;
    private Long refAudioDurationMs;
    private String refAudioFilename;

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
