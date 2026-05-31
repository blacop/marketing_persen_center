package com.beukay.marketing.person.domain.videoAssembly.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class VideoAssemblyTask extends Entity<Long> {
    private String taskCode;
    private String blueprintCode;
    private String status;
    private String platform;
    private Integer targetDuration;
    private String resultVideoUrl;
    private String interventionStatus;
    private String summaryJson;
}
