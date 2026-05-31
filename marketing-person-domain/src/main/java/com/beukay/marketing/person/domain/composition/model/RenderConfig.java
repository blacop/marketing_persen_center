package com.beukay.marketing.person.domain.composition.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 渲染任务级配置（domain 侧值对象）。
 * 与 RenderConfigDTO 字段对齐，落 render_job.render_config_json。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RenderConfig {

    /** 9:16 / 3:4 / 16:9 / 4:3 / 1:1 */
    private String aspectRatio;
    /** 720P / 1080P / 4K */
    private String resolution;
    private Integer fps;
    /** MP4 / MOV */
    private String container;
    /** H264 / HEVC */
    private String codec;
    /** 镜像概率 0-100 */
    private Integer mirrorProb;
    /** 100-200 百分比 */
    private Integer trimMin;
    private Integer trimMax;
    /** DIRECT / PREVIEW_EDIT / LEGACY */
    private String exportType;
    /** 导出目录绝对路径 */
    private String exportPath;
}
