package com.beukay.marketing.person.infrastructure.composition.oss;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/** Aliyun OSS 配置 */
@Data
@Configuration
@ConfigurationProperties(prefix = "aliyun.oss")
public class OssProperties {

    /** 例 https://oss-cn-beijing.aliyuncs.com */
    private String endpoint;

    private String accessKeyId;

    private String accessKeySecret;

    private String bucket;

    /** CDN 域名（可空），存在时 publicOrSignedUrl 会返回 CDN URL */
    private String cdnDomain;

    /** 直传签名默认 ttl（秒） */
    private Long uploadSignatureTtlSeconds = 3600L;

    /** 下载签名默认 ttl（秒） */
    private Long downloadSignatureTtlSeconds = 3600L;
}
