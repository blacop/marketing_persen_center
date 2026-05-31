package com.beukay.marketing.person.client.composition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/** 章节 DTO */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompositionChapterDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Long projectId;
    private Integer sortNo;
    private String name;
    /** MaterialCategory 枚举名；章节按此分类从素材库选片 */
    private String category;
    /** ChapterAudioMode 枚举名 */
    private String audioMode;
    private Long voiceoverId;
    /** 章节多配音池（每条作品按 plan hash 随机抽一个） */
    private List<Long> voiceoverIds;
    private Integer fixedClipCount;
    private Long minDurationMs;
    private Boolean allowVoiceoverReuse;
    private Boolean stripOriginalAudio;
    /** TRIM_HEAD / TRIM_TAIL / TRIM_BOTH —— 模式 2 长度处理=CROP 时使用 */
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
    /** 选片标签过滤器（id 列表） */
    private List<Long> tagFilterIds;
    /** 同时返回标签快照便于前端展示 */
    private List<MaterialTagDTO> tagFilter;
    /** FOLDER 模式：直接指定该章节素材 clipId 列表 */
    private List<Long> materialClipIds;
    /** FOLDER 模式：来源子目录名 */
    private String sourceFolderName;
    /** 是否在素材之间添加转场（前端开关，后端渲染暂不消费） */
    private Boolean transitionEnabled;
}
