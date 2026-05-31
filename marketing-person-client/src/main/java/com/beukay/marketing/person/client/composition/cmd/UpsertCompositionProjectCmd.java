package com.beukay.marketing.person.client.composition.cmd;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/** 创建/更新合成项目命令（id 为空 = 创建） */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpsertCompositionProjectCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    @NotBlank
    private String name;

    private String description;

    /** SUN_WUKONG / ZHU_GE_LIANG */
    @NotNull
    private String mode;

    /** ChapterSource：CATEGORY（默认）/ FOLDER */
    private String chapterSource;

    /** ROOKIE / MATRIX */
    private String combinationStrategy;

    @Min(1) @Max(1000)
    private Integer targetCount;

    private Long globalBgmVoiceoverId;
    /** BGM 库：voiceover_asset.id 列表（一般由 importChapters 写入，updateProject 也可改） */
    private java.util.List<Long> bgmVoiceoverIds;
    /** LOOP / PICK_AGAIN */
    private String bgmLoopMode;
    /** 0-100 */
    private Integer bgmVolume;
    /** 1-based */
    private Integer bgmStartChapter;
    private Integer outputWidth;
    private Integer outputHeight;
    private Integer outputFps;

    /** DRAFT / READY / ARCHIVED */
    private String status;
}
