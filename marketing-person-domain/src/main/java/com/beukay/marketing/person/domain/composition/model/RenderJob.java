package com.beukay.marketing.person.domain.composition.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/** 渲染任务 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RenderJob extends Entity<Long> {

    private Long projectId;
    private Integer totalCount;
    private Integer successCount;
    private Integer failedCount;
    /** RenderStatus 枚举名 */
    private String status;
    private Integer progressPercent;
    private String currentStage;
    private String errorMsg;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private String mqMessageId;
    /** 本次渲染配置；持久化为 render_job.render_config_json */
    private RenderConfig renderConfig;
}
