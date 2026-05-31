package com.beukay.marketing.person.domain.videoSegment.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * 视频最小单元领域实体（片段级拆解，与飞书最小单元库字段对齐）
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class VideoSegment extends Entity<Long> {

    /** 来源任务ID */
    private String taskId;
    /** 视频ID */
    private String videoId;
    /** SKU ID */
    private String skuId;
    /** 片段序号（从1开始） */
    private int segmentIndex;
    /** 开始秒 */
    private int startSec;
    /** 结束秒 */
    private int endSec;
    /** 结构标签 */
    private String structureTag;
    /** 动机 */
    private String motivation;
    /** 手法 */
    private String technique;
    /** 镜头语言 */
    private String cameraLanguage;
    /** 场景 */
    private String scene;
    /** 信号强度 1-5 */
    private int signalStrength;
    /** 金句 */
    private String keyPhrase;
    /** 对应话术 */
    private String script;
    /** 卖点内容 */
    private String sellingPoint;
    /** 是否决定性画面 */
    private boolean decisiveFrame;
    /** 决定性画面描述 */
    private String decisiveFrameDesc;
    /** 人物量级 */
    private String influencerLevel;
    /** 人物画像 */
    private String audiencePersona;
    /** BGM */
    private String bgm;
    /** 节奏 */
    private String rhythm;
    /** 服化道 */
    private String wardrobe;
    /** 声音 */
    private String audio;
    /** 肤质肤况 */
    private String skinType;
    /** 热点关键词 */
    private String trending;
    /** 验证状态 */
    private String verificationStatus;
}
