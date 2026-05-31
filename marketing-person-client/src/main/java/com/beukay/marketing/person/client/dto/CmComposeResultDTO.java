package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CmComposeResultDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private String taskCode;
    private String collectionCode;
    private String mode;
    private String status;
    private BigDecimal totalDurationSec;
    private String resultVideoUrl;
    private String errorMsg;
    private List<Clip> clips;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Clip implements Serializable {
        private static final long serialVersionUID = 1L;
        private Integer sectionNo;
        private String stageCode;
        private String segmentCode;
        private String videoUrl;
        private BigDecimal startSec;
        private BigDecimal endSec;
        private BigDecimal durationSec;
    }
}
