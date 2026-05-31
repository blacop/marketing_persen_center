package com.beukay.marketing.person.domain.cutmatrix.chapter.model;

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
public class CmChapter extends Entity<Long> {
    private String chapterCode;
    private String collectionCode;
    private String name;
    private String stageCode;
    private Integer orderNo;
    private String voiceClipUrl;
}
