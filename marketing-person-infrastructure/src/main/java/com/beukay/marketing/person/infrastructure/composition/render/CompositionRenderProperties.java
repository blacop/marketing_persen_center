package com.beukay.marketing.person.infrastructure.composition.render;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/** 渲染相关配置 */
@Data
@Configuration
@ConfigurationProperties(prefix = "composition.render")
public class CompositionRenderProperties {

    /** ffmpeg 可执行路径，默认从 PATH 找 */
    private String ffmpegPath = "ffmpeg";

    /** ffprobe 可执行路径 */
    private String ffprobePath = "ffprobe";

    /** 工作根目录（每条 output 一个子目录） */
    private String workspaceDir = System.getProperty("java.io.tmpdir") + "/composition";

    /** 单进程内并发渲染上限（信号量） */
    private int parallelism = 2;

    /** 单条 output 渲染最大耗时（秒） */
    private int outputTimeoutSeconds = 600;

    /** 渲染失败时是否保留临时目录（用于排查） */
    private boolean keepWorkspaceOnFailure = false;

    /** OSS 未配置时是否仍然让流水线跑（结果只保存在本地，oss_key 写本地路径） */
    private boolean fallbackToLocalIfOssMissing = true;
}
