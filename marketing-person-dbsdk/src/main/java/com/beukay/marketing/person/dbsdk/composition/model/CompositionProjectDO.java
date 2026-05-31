package com.beukay.marketing.person.dbsdk.composition.model;

import lombok.Data;

import java.time.LocalDateTime;

/** composition_project 表 */
@Data
public class CompositionProjectDO {

    private Long id;

    private String name;
    private String description;
    private String mode;
    /** CATEGORY / FOLDER */
    private String chapterSource;
    private String combinationStrategy;
    private Integer targetCount;
    private Long globalBgmVoiceoverId;
    /** BGM 库（CSV）：voiceover_asset.id 列表 */
    private String bgmVoiceoverIds;
    /** LOOP=BGM 循环；PICK_AGAIN=再随机抽一首 */
    private String bgmLoopMode;
    /** BGM 音量 0-100 */
    private Integer bgmVolume;
    /** 从第几章开始应用 BGM（1-based） */
    private Integer bgmStartChapter;
    private Integer outputWidth;
    private Integer outputHeight;
    private Integer outputFps;
    private String status;
    /** JSON 字符串 */
    private String extra;

    /** 八字段 */
    private String nezhaTenantCode;
    private Boolean isDeleted;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
}
