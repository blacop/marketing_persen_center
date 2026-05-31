package com.beukay.marketing.person.client.composition.cmd;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/** 源视频元数据入库命令（前端上传到 /local-files 后调用此接口） */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSourceVideoCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank
    private String ossKey;

    @NotBlank
    private String originalName;

    private Long durationMs;
    private Long fileSize;
    private Integer width;
    private Integer height;
}
