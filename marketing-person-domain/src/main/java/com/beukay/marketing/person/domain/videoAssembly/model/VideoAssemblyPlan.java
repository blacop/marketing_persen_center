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
public class VideoAssemblyPlan extends Entity<Long> {
    private String taskCode;
    private Integer sectionNo;
    private Long segmentId;
    private String videoId;
    private String selectionReasonJson;
}
