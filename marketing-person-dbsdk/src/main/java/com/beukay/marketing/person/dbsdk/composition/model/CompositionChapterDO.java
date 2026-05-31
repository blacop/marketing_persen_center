package com.beukay.marketing.person.dbsdk.composition.model;

import lombok.Data;

import java.time.LocalDateTime;

/** composition_chapter 表 */
@Data
public class CompositionChapterDO {

    private Long id;

    private Long projectId;
    private Integer sortNo;
    private String name;
    /** MaterialCategory 名称；章节按此从素材库选片 */
    private String category;
    private String audioMode;
    private Long voiceoverId;
    /** CSV：章节多配音池 voiceover_asset.id 列表 */
    private String voiceoverIds;
    private Integer fixedClipCount;
    private Long minDurationMs;
    private Boolean allowVoiceoverReuse;
    private Boolean stripOriginalAudio;
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
    /** JSON 字符串：[{tagId,name}] */
    private String tagFilter;
    /** CSV：FOLDER 模式直接指定的素材 clipId 列表 */
    private String materialClipIds;
    /** FOLDER 模式：上传时的子目录名 */
    private String sourceFolderName;
    /** 是否在素材之间添加转场（前端开关，后端暂不消费） */
    private Boolean transitionEnabled;
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
