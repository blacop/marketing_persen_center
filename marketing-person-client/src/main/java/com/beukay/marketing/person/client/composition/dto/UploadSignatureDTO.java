package com.beukay.marketing.person.client.composition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * OSS 直传签名 DTO。前端拿到签名后用 PUT 直接上传到 OSS。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadSignatureDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** OSS object key（相对路径，无前导 /） */
    private String ossKey;
    /** 直传 PUT URL（含签名） */
    private String uploadUrl;
    /** 上传成功后用于读取的 URL（可能是签名 URL，也可能是 CDN 域名 URL） */
    private String accessUrl;
    /** 签名过期时间（秒） */
    private Long expiresInSeconds;
}
