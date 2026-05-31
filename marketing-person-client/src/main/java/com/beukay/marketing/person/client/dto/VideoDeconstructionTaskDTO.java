package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoDeconstructionTaskDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String taskId;
    private String status;
    private String sourceType;
    private String sourceName;
    private String skuId;
    private Integer progressPercent;
    private String stage;
    private String statusMessage;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private VideoDeconstructionDTO result;
}
