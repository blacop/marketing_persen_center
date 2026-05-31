package com.beukay.marketing.person.client.composition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/** 素材片段 DTO */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialClipDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
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
    private String sha256;
    /** MANUAL_UPLOAD / DECONSTRUCTION_AGENT */
    private String sourceType;
    /** 来源额外信息 JSON（拆解 agent 写入原视频 URL / runId 等） */
    private String sourceExtra;
    /** 镜头类型 MaterialCategory 名称（如 HOOK / EFFICACY），可空 */
    private String category;
    /** 标签缓存（非 JOIN 路径） */
    private List<MaterialTagDTO> tags;
    /** OSS 直接访问/CDN URL（按需返回） */
    private String accessUrl;

    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
