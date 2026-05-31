package com.beukay.marketing.person.client.composition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * 组合预览 DTO（不渲染，只展示）。
 * 每条 plan 描述一条预期产出的组装方案。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompositionPlanPreviewDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer requestedCount;
    private Integer generatedCount;
    private List<Plan> plans;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Plan implements Serializable {
        private static final long serialVersionUID = 1L;
        /** SHA-256，去重用 */
        private String planHash;
        /** 章节顺序 → 选中的素材列表 */
        private List<ChapterPick> chapters;
        /** 估算总时长 */
        private Long estimatedDurationMs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterPick implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long chapterId;
        private String chapterName;
        private String audioMode;
        private Long voiceoverId;
        private List<ClipPickDTO> picks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClipPickDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long clipId;
        private String originalName;
        private Long startMs;
        private Long endMs;
        private Long takenDurationMs;
        /** 是否做了裁剪 */
        private Boolean trimmed;
    }
}
