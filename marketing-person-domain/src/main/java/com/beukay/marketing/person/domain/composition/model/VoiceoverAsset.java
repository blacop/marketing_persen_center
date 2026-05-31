package com.beukay.marketing.person.domain.composition.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/** 配音资源（领域实体） */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class VoiceoverAsset extends Entity<Long> {

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
}
