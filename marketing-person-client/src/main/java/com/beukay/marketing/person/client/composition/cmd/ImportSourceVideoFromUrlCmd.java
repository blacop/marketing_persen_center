package com.beukay.marketing.person.client.composition.cmd;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/** 通过 URL 导入源视频（后端下载到本地） */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportSourceVideoFromUrlCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 视频直链 URL（支持 http/https） */
    @NotBlank
    private String url;

    /** 自定义名称（可空，默认从 URL 路径提取） */
    private String originalName;
}
