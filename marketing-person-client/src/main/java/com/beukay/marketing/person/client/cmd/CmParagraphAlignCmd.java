package com.beukay.marketing.person.client.cmd;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CmParagraphAlignCmd implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotBlank
    private String collectionCode;

    /** 可选：source SKU；冗余字段方便溯源 */
    private String skuId;

    /** 配音 URL（可空，P0 阶段算法只用时长） */
    private String narrationUrl;

    @NotNull
    private List<Section> sections;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Section implements Serializable {
        private static final long serialVersionUID = 1L;
        private Integer sectionNo;
        @NotBlank
        private String stageCode;
        private String stageName;
        @NotNull
        private Integer narrationDurationSec;
        private List<String> requiredTags;
    }
}
