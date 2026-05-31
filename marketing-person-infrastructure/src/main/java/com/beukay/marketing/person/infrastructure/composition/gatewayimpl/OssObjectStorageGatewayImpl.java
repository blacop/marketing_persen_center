package com.beukay.marketing.person.infrastructure.composition.gatewayimpl;

import com.aliyun.oss.HttpMethod;
import com.aliyun.oss.OSS;
import com.aliyun.oss.model.GeneratePresignedUrlRequest;
import com.aliyun.oss.model.ObjectMetadata;
import com.beukay.marketing.person.domain.composition.gateway.ObjectStorageGateway;
import com.beukay.marketing.person.infrastructure.composition.oss.OssProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Date;

@Component
@RequiredArgsConstructor
@Log4j2
public class OssObjectStorageGatewayImpl implements ObjectStorageGateway {

    private final OSS ossClient;
    private final OssProperties props;

    @Override
    public String upload(String key, InputStream in, String contentType, long contentLength) {
        ObjectMetadata meta = new ObjectMetadata();
        if (contentType != null && !contentType.isBlank()) {
            meta.setContentType(contentType);
        }
        if (contentLength > 0) {
            meta.setContentLength(contentLength);
        }
        ossClient.putObject(props.getBucket(), key, in, meta);
        return key;
    }

    @Override
    public Path download(String key, Path target) {
        try {
            Files.createDirectories(target.getParent());
            try (InputStream in = ossClient.getObject(props.getBucket(), key).getObjectContent()) {
                Files.copy(in, target);
            }
            return target;
        } catch (IOException e) {
            throw new IllegalStateException("OSS download failed: " + key, e);
        }
    }

    @Override
    public String signedPutUrl(String key, String contentType, Duration ttl) {
        GeneratePresignedUrlRequest req = new GeneratePresignedUrlRequest(props.getBucket(), key, HttpMethod.PUT);
        req.setExpiration(new Date(System.currentTimeMillis() + ttl.toMillis()));
        if (contentType != null && !contentType.isBlank()) {
            req.setContentType(contentType);
        }
        URL url = ossClient.generatePresignedUrl(req);
        return url.toString();
    }

    @Override
    public String signedGetUrl(String key, Duration ttl) {
        GeneratePresignedUrlRequest req = new GeneratePresignedUrlRequest(props.getBucket(), key, HttpMethod.GET);
        req.setExpiration(new Date(System.currentTimeMillis() + ttl.toMillis()));
        URL url = ossClient.generatePresignedUrl(req);
        return url.toString();
    }

    @Override
    public String publicOrSignedUrl(String key, Duration signedTtl) {
        if (props.getCdnDomain() != null && !props.getCdnDomain().isBlank()) {
            String base = props.getCdnDomain();
            if (!base.endsWith("/")) {
                base += "/";
            }
            return base + key;
        }
        return signedGetUrl(key, signedTtl);
    }

    @Override
    public void delete(String key) {
        ossClient.deleteObject(props.getBucket(), key);
    }

    @Override
    public boolean exists(String key) {
        return ossClient.doesObjectExist(props.getBucket(), key);
    }
}
