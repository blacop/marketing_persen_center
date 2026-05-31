package com.beukay.marketing.person.client.composition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/** 配音资源 DTO */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoiceoverAssetDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String ossKey;
    /** UPLOAD / TTS_DOUBAO */
    private String source;
    private String textContent;
    private String voiceCode;
    private Double speed;
    private Long durationMs;
    private Long fileSize;
    private String format;
    /** 镜头类型 MaterialCategory（与素材共用） */
    private String category;
    private String accessUrl;

    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
