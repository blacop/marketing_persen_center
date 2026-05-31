package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoAssemblyPlanSectionDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Integer sectionNo;
    private Long segmentId;
    private String videoId;
    private String selectionReasonJson;
}
