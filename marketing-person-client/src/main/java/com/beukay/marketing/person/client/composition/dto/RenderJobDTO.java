package com.beukay.marketing.person.client.composition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/** 渲染任务 DTO */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RenderJobDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
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
    private LocalDateTime createAt;
    /** 本次渲染配置 */
    private RenderConfigDTO renderConfig;
}
