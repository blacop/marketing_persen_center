package com.beukay.marketing.person.client.cmd;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 通用编排参数（孙悟空 / 诸葛亮）。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CmComposeModeCmd implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotBlank
    private String collectionCode;

    /**
     * 孙悟空: 整段配音目标时长（秒）
     * 诸葛亮: 每章节目标时长（秒）
     */
    @NotNull
    private Double durationSec;

    /** 配音 asset code（孙悟空时, 替换原声） */
    private String narrationAssetCode;

    /** 随机种子（可空） */
    private Long seed;
}
