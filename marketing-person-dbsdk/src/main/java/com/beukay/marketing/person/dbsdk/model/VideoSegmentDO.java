package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 视频最小单元 DO（对应 video_segment 表）
 */
@Data
@TableName("video_segment")
public class VideoSegmentDO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    /** 来源任务ID */
    private String taskId;
    /** 视频ID */
    private String videoId;
    /** SKU ID */
    private String skuId;
    /** 片段序号 */
    private Integer segmentIndex;
    /** 开始秒 */
    private Integer startSec;
    /** 结束秒 */
    private Integer endSec;
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
    private Integer signalStrength;
    /** 金句 */
    private String keyPhrase;
    /** 对应话术 */
    private String script;
    /** 卖点内容 */
    private String sellingPoint;
    /** 是否决定性画面 */
    private Integer isDecisiveFrame;
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
    private String nezhaTenantCode;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
    private Integer isDeleted;
}
