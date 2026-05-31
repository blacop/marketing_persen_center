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

/**
 * FOLDER 模式：从已上传的素材/配音构造章节列表（全量替换原章节）。
 * 浏览器端解析目录后调用：每个子目录 = 一个章节。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportChaptersCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull
    @NotEmpty
    @Valid
    private List<ChapterInput> chapters;

    /** BGM 库：voiceover_asset.id 列表（解析根目录下 bgm/ 子目录上传得到，可空） */
    private List<Long> bgmVoiceoverIds;

    /** BGM 比视频短时的策略：LOOP（默认）/ PICK_AGAIN */
    private String bgmLoopMode;

    /** BGM 音量 0-100，默认 70 */
    private Integer bgmVolume;

    /** 从第几章开始应用 BGM（1-based），默认 1 */
    private Integer bgmStartChapter;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterInput implements Serializable {
        private static final long serialVersionUID = 1L;

        /** 章节顺序（1-based，按子目录字典序） */
        @NotNull
        private Integer sortNo;

        /** 章节名（默认取子目录名） */
        private String name;

        /** 来源子目录名 */
        @NotNull
        private String sourceFolderName;

        /** 章节内已上传的素材 clipId 列表（按子目录内文件名字典序） */
        @NotNull
        @NotEmpty
        private List<Long> materialClipIds;

        /** 章节主配音 id（兼容字段，等于 voiceoverIds 第一个） */
        private Long voiceoverId;
        /** 章节文件夹下所有音频文件作为多配音池；为空时仅用 voiceoverId */
        private List<Long> voiceoverIds;

        /** 固定素材数（NO_VO_FIXED_COUNT 时使用，默认 = materialClipIds.size） */
        private Integer fixedClipCount;
    }
}
