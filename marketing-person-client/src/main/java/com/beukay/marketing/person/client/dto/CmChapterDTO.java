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
public class CmChapterDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String chapterCode;
    private String collectionCode;
    private String name;
    private String stageCode;
    private Integer orderNo;
    private String voiceClipUrl;
    private Integer segmentCount;
}
