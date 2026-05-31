package com.beukay.marketing.person.domain.composition.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

/** 合成项目（聚合根） */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CompositionProject extends Entity<Long> {

    private String name;
    private String description;
    /** SUN_WUKONG / ZHU_GE_LIANG */
    private String mode;
    /** ChapterSource：CATEGORY（默认 9 枚举） / FOLDER（用户上传文件夹解析） */
    private String chapterSource;
    /** ROOKIE / MATRIX */
    private String combinationStrategy;
    private Integer targetCount;
    private Long globalBgmVoiceoverId;
    /** BGM 库：voiceover_asset.id 列表（FOLDER 模式 bgm/ 子目录上传） */
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
    private String extra;

    /** 章节（detail 查询时填充） */
    private List<CompositionChapter> chapters;
}
