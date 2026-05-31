package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoAssemblyDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String taskCode;
    private String blueprintCode;
    private String status;
    private String platform;
    private Integer targetDuration;
    private String resultVideoUrl;
    private String interventionStatus;
    private String summaryJson;
    private LocalDateTime createAt;
    private String createName;
    private List<VideoAssemblyCandidateDTO> candidates;
    private List<VideoAssemblyPlanSectionDTO> planSections;
}
