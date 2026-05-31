package com.beukay.marketing.person.client.composition.cmd;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * 素材元数据入库命令。前端 OSS 直传完成后调用。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMaterialClipCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank
    private String ossKey;

    /** VIDEO / IMAGE */
    @NotNull
    private String kind;

    @NotBlank
    private String originalName;

    private Long durationMs;
    private Integer width;
    private Integer height;
    private Double fps;
    private Long bitrate;
    private Long fileSize;

    /** 客户端计算的 sha256，用于去重 */
    private String sha256;

    /** 默认 MANUAL_UPLOAD；拆解 agent 入库时传 DECONSTRUCTION_AGENT */
    private String sourceType;

    /** 来源附加信息 JSON */
    private String sourceExtra;

    /** 镜头类型 MaterialCategory 名称；CATEGORY 模式必填，FOLDER 模式可空 */
    private String category;

    /** 关联标签 ID 列表 */
    private List<Long> tagIds;
}
