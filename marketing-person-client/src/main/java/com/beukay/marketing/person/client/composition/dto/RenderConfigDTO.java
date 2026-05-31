package com.beukay.marketing.person.client.composition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 渲染任务级配置（前端「开始渲染」三段弹窗收集到的参数）
 * 提交时带在 SubmitRenderCmd 里，落 render_job.render_config_json，
 * 渲染管线读它来决定输出尺寸 / 编码 / 镜像 / 裁剪等。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RenderConfigDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 9:16 / 3:4 / 16:9 / 4:3 / 1:1 */
    private String aspectRatio;
    /** 720P / 1080P / 4K（按短边） */
    private String resolution;
    /** 24 / 30 / 60 */
    private Integer fps;
    /** MP4 / MOV */
    private String container;
    /** H264 / HEVC */
    private String codec;
    /** 镜像（水平翻转）概率 0-100；文件名以 t= 开头的素材锁定不翻转 */
    private Integer mirrorProb;
    /** 随机裁剪缩放范围下限 100-200（百分比） */
    private Integer trimMin;
    /** 上限 100-200（百分比） */
    private Integer trimMax;
    /** DIRECT（直接走剪映自动化） / PREVIEW_EDIT（剪映人工） / LEGACY（ffmpeg 旧流水线，默认） */
    private String exportType;
    /** 导出目录绝对路径；非空时成功输出会拷贝到该目录 */
    private String exportPath;
}
