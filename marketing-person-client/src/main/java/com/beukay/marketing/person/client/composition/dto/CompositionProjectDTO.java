package com.beukay.marketing.person.client.composition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/** 合成项目 DTO */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompositionProjectDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String description;
    /** SUN_WUKONG / ZHU_GE_LIANG */
    private String mode;
    /** ChapterSource：CATEGORY / FOLDER */
    private String chapterSource;
    /** ROOKIE / MATRIX */
    private String combinationStrategy;
    private Integer targetCount;
    private Long globalBgmVoiceoverId;
    /** BGM 库：voiceover_asset.id 列表 */
    private List<Long> bgmVoiceoverIds;
    /** LOOP=BGM 循环；PICK_AGAIN=再随机抽一首 */
    private String bgmLoopMode;
    /** BGM 音量 0-100 */
    private Integer bgmVolume;
    /** 从第几章开始应用 BGM（1-based） */
    private Integer bgmStartChapter;
    private Integer outputWidth;
    private Integer outputHeight;
    private Integer outputFps;
    /** DRAFT / READY / ARCHIVED */
    private String status;
    /** 章节快照（详情查询时返回） */
    private List<CompositionChapterDTO> chapters;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
