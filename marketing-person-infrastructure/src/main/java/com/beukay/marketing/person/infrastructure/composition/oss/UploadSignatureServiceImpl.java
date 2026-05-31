package com.beukay.marketing.person.infrastructure.composition.oss;

import com.beukay.marketing.person.domain.composition.ability.UploadSignatureService;
import com.beukay.marketing.person.domain.composition.gateway.ObjectStorageGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UploadSignatureServiceImpl implements UploadSignatureService {

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyyMM");
    private static final String DEFAULT_TENANT = "default";

    private final ObjectStorageGateway objectStorageGateway;
    private final OssProperties props;

    @Override
    public Result issue(String bizType, String filename, String sha256, String contentType) {
        String key = buildKey(bizType, filename, sha256);
        Duration ttl = Duration.ofSeconds(props.getUploadSignatureTtlSeconds());
        String putUrl = objectStorageGateway.signedPutUrl(key, contentType, ttl);
        String accessUrl = objectStorageGateway.publicOrSignedUrl(
                key, Duration.ofSeconds(props.getDownloadSignatureTtlSeconds()));
        return new Result(key, putUrl, accessUrl, ttl.getSeconds());
    }

    private String buildKey(String bizType, String filename, String sha256) {
        String ext = extractExt(filename);
        String month = LocalDate.now().format(MONTH_FMT);
        return switch (bizType) {
            case "material" -> {
                String name = (sha256 == null || sha256.isBlank()) ? UUID.randomUUID().toString().replace("-", "") : sha256;
                yield String.format("composition/%s/material/%s/%s%s", DEFAULT_TENANT, month, name, ext);
            }
            case "voiceover" -> String.format("composition/%s/voiceover/%s/%s%s", DEFAULT_TENANT, month,
                    UUID.randomUUID().toString().replace("-", ""), ext);
            case "output" -> String.format("composition/%s/output/%s/%s%s", DEFAULT_TENANT, month,
                    UUID.randomUUID().toString().replace("-", ""), ext);
            default -> throw new IllegalArgumentException("不支持的 bizType: " + bizType);
        };
    }

    private String extractExt(String filename) {
        if (filename == null) {
            return "";
        }
        int idx = filename.lastIndexOf('.');
        if (idx <= 0 || idx == filename.length() - 1) {
            return "";
        }
        String ext = filename.substring(idx).toLowerCase();
        return ext.length() > 8 ? "" : ext;
    }
}
