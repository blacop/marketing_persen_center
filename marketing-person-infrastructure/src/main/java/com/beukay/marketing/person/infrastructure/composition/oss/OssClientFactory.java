package com.beukay.marketing.person.infrastructure.composition.oss;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Aliyun OSS 客户端 Bean。endpoint/ak/sk 任意未配置时不创建 Bean，
 * 由消费方做 ObjectProvider 兼容（PoC 期间未接 OSS 也可启动）。
 */
@Configuration
@RequiredArgsConstructor
@Log4j2
public class OssClientFactory {

    private final OssProperties props;

    @Bean(destroyMethod = "shutdown")
    public OSS ossClient() {
        boolean configured = !isBlank(props.getEndpoint()) && !isBlank(props.getAccessKeyId())
                && !isBlank(props.getAccessKeySecret()) && !isBlank(props.getBucket());
        if (!configured) {
            log.warn("[oss] OSS 未配置完整 endpoint/ak/sk/bucket，启动占位 client；上传/下载会抛异常。");
        }
        // OSS SDK 不允许空 AK/SK，未配置时用占位值满足构造校验，运行时调用会自然失败
        return new OSSClientBuilder()
                .build(orDefault(props.getEndpoint(), "https://oss-placeholder.local"),
                       orDefault(props.getAccessKeyId(), "placeholder-ak"),
                       orDefault(props.getAccessKeySecret(), "placeholder-sk"));
    }

    private static boolean isBlank(String s) { return s == null || s.isBlank(); }
    private static String orDefault(String s, String def) { return isBlank(s) ? def : s; }
}
