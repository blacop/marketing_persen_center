package com.beukay.marketing.person.app.cutmatrix.runtime;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "cutmatrix")
@Data
public class CmStorageProperties {
    private String storageRoot = "cutmatrix-storage";
    private String ffmpegBin = "ffmpeg";
    private String ffprobeBin = "ffprobe";
    private String baseUrl = "http://localhost:30000";
}
