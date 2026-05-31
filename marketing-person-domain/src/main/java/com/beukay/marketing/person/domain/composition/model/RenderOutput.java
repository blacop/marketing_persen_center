package com.beukay.marketing.person.domain.composition.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/** 渲染产出 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RenderOutput extends Entity<Long> {

    private Long jobId;
    private Long projectId;
    /** 组合方案 sha256，去重核心 */
    private String planHash;
    /** JSON */
    private String planSnapshot;
    private String ossKey;
    private Long durationMs;
    private Integer width;
    private Integer height;
    private Long fileSize;
    /** RenderStatus 枚举名 */
    private String status;
    private String errorMsg;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
}
