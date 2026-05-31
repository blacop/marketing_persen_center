package com.beukay.marketing.person.client.composition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/** 渲染产出 DTO */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RenderOutputDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Long jobId;
    private Long projectId;
    private String planHash;
    private String planSnapshot;
    private String ossKey;
    private String accessUrl;
    private Long durationMs;
    private Integer width;
    private Integer height;
    private Long fileSize;
    /** RenderStatus 枚举名 */
    private String status;
    private String errorMsg;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private LocalDateTime createAt;
}
