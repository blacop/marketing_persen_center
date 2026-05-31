package com.beukay.marketing.person.domain.composition.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

/** 源视频（视频拆解工作流） */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SourceVideo extends Entity<Long> {

    private String ossKey;
    private String originalName;
    private Long durationMs;
    private Long fileSize;
    private Integer width;
    private Integer height;
    /** 反序列化后的片段列表（GatewayImpl 处理 segments_json 编解码） */
    private List<Segment> segments;
    /** DRAFT / EXPORTED */
    private String status;

    /** 视频拆解片段值对象 */
    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Segment {
        private Long startMs;
        private Long endMs;
        /** MaterialCategory 枚举名 */
        private String category;
        /** 用户给该片段起的名字（可空） */
        private String name;
        /** 备注（可空） */
        private String memo;
        /** 切片导出后写回的 material_clip.id（成功导出过的片段不应重复切） */
        private Long materialClipId;
    }
}
