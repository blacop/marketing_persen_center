package com.beukay.marketing.person.domain.composition.ability;

/**
 * OSS 直传签名服务。
 * 输入业务类型 + 原始文件名 + 可选 sha256，输出 (key, putUrl, accessUrl, ttl)。
 */
public interface UploadSignatureService {

    Result issue(String bizType, String filename, String sha256, String contentType);

    record Result(String ossKey, String uploadUrl, String accessUrl, long expiresInSeconds) {}
}
