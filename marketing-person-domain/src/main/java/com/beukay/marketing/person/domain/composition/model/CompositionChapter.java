package com.beukay.marketing.person.domain.composition.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

/** 合成章节 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CompositionChapter extends Entity<Long> {

    private Long projectId;
    private Integer sortNo;
    private String name;
    /** MaterialCategory 枚举名；章节按此分类从素材库选片 */
    private String category;
    /** ChapterAudioMode 枚举名 */
    private String audioMode;
    private Long voiceoverId;
    /** 多配音池：voiceover_asset.id 列表（FOLDER 模式章节文件夹下所有 mp3 都进来） */
    private List<Long> voiceoverIds;
    private Integer fixedClipCount;
    private Long minDurationMs;
    private Boolean allowVoiceoverReuse;
    private Boolean stripOriginalAudio;
    /** TRIM_HEAD/TRIM_TAIL/TRIM_BOTH —— 模式 2 长度处理=CROP 时使用 */
    private String overflowTrim;
    /** 模式 2「长度处理方式」：CROP 剪切 / SPEED 变速 */
    private String lengthAdjustMode;
    /** 配音重复率：ONCE 只用一次 / REUSE 允许重复（模式 1/2/3） */
    private String audioReuseMode;
    /** 模式 3 循环策略：FILL_THEN_CROP / FIXED_ROUNDS_THEN_SPEED */
    private String loopStrategy;
    /** 模式 3 循环轮次（仅策略 = FIXED_ROUNDS_THEN_SPEED 时使用） */
    private Integer loopRounds;
    private Double repeatRate;
    /** 选片标签过滤器 */
    private List<MaterialTag> tagFilter;
    /** FOLDER 模式：直接指定该章节素材 clipId 列表；非空时跳过 category/tag 选片 */
    private List<Long> materialClipIds;
    /** FOLDER 模式：来源子目录名（展示用） */
    private String sourceFolderName;
    /** 是否在素材之间添加转场（前端开关，后端渲染暂不消费） */
    private Boolean transitionEnabled;
}
