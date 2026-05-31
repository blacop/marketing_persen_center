package com.beukay.marketing.person.client.composition.cmd;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/** 全量替换源视频的片段列表 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSegmentsCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull
    @Valid
    private List<SegmentInput> segments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SegmentInput implements Serializable {
        private static final long serialVersionUID = 1L;

        @NotNull
        private Long startMs;

        @NotNull
        private Long endMs;

        /** MaterialCategory 枚举名（导出时必须有；草稿阶段可空） */
        private String category;

        private String name;
        private String memo;
        /** 已导出过的片段 → material_clip.id；新片段不带 */
        private Long materialClipId;
    }
}
