package com.beukay.marketing.person.client.composition.cmd;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/** 批量保存项目章节（全量替换：未在列表内的章节会被软删） */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveChaptersCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull
    @NotEmpty
    @Valid
    private List<ChapterInput> chapters;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterInput implements Serializable {
        private static final long serialVersionUID = 1L;

        /** 已存在则带 id；新增不带 */
        private Long id;

        private Integer sortNo;

        private String name;

        /** MaterialCategory 枚举名；章节按此分类从素材库选片 */
        private String category;

        /** ChapterAudioMode 枚举名 */
        @NotNull
        private String audioMode;

        private Long voiceoverId;
        /** 章节多配音池（前端可选传） */
        private List<Long> voiceoverIds;
        private Integer fixedClipCount;
        private Long minDurationMs;
        private Boolean allowVoiceoverReuse;
        private Boolean stripOriginalAudio;
        /** TRIM_HEAD / TRIM_TAIL / TRIM_BOTH */
        private String overflowTrim;
        /** 模式 2 长度处理方式：CROP / SPEED */
        private String lengthAdjustMode;
        /** 配音重复率：ONCE / REUSE */
        private String audioReuseMode;
        /** 模式 3 循环策略：FILL_THEN_CROP / FIXED_ROUNDS_THEN_SPEED */
        private String loopStrategy;
        /** 模式 3 循环轮次 */
        private Integer loopRounds;
        private Double repeatRate;
        /** 选片 tag id 列表 */
        private List<Long> tagFilterIds;
        /** FOLDER 模式：直接指定该章节素材 clipId 列表（非空时跳过 category/tag 选片） */
        private List<Long> materialClipIds;
        /** FOLDER 模式：来源子目录名 */
        private String sourceFolderName;
        /** 是否在素材之间添加转场（前端开关） */
        private Boolean transitionEnabled;
    }
}
