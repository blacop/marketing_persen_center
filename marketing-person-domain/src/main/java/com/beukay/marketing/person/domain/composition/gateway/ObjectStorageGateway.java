package com.beukay.marketing.person.domain.composition.gateway;

import java.io.InputStream;
import java.nio.file.Path;
import java.time.Duration;

/**
 * 对象存储网关。隔离上层业务对具体云存储（OSS/MinIO/S3）的依赖。
 */
public interface ObjectStorageGateway {

    /** 服务端上传（会消耗服务带宽，前端直传场景不走这条） */
    String upload(String key, InputStream in, String contentType, long contentLength);

    /** 下载到本地路径 */
    Path download(String key, Path target);

    /**
     * 生成上传 PUT 签名 URL，前端直传使用。
     * @param contentType 限定 PUT 时的 Content-Type 头（可空）
     * @param ttl 有效期
     */
    String signedPutUrl(String key, String contentType, Duration ttl);

    /** 生成下载/读取签名 URL */
    String signedGetUrl(String key, Duration ttl);

    /** 永久访问 URL（CDN 域名拼接 key），未配置 CDN 时返回签名 URL */
    String publicOrSignedUrl(String key, Duration signedTtl);

    void delete(String key);

    boolean exists(String key);
}
