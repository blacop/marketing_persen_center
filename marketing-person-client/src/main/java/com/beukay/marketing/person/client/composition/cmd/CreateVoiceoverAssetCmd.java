package com.beukay.marketing.person.client.composition.cmd;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 配音元数据入库命令。前端 OSS 直传完成后调用。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateVoiceoverAssetCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank
    private String ossKey;

    /** UPLOAD / TTS_DOUBAO */
    private String source;

    private String textContent;
    private String voiceCode;
    private Double speed;
    private Long durationMs;
    private Long fileSize;
    private String format;

    /** 镜头类型 MaterialCategory；CATEGORY 模式必填，FOLDER 模式可空 */
    private String category;
}
