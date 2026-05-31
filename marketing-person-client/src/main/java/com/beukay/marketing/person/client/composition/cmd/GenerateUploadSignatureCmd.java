package com.beukay.marketing.person.client.composition.cmd;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/** 申请 OSS 直传签名 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateUploadSignatureCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    /** material / voiceover / output */
    @NotBlank
    @Pattern(regexp = "material|voiceover|output")
    private String bizType;

    /** 原始文件名（仅用于推断扩展名） */
    @NotBlank
    private String filename;

    /** 客户端预先计算的 sha256（素材类用于去重） */
    private String sha256;

    /** 上传 Content-Type，可空（OSS 默认按扩展名推断） */
    private String contentType;
}
