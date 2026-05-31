package com.beukay.marketing.person.client.composition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/** 源视频 DTO */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SourceVideoDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String ossKey;
    private String originalName;
    private Long durationMs;
    private Long fileSize;
    private Integer width;
    private Integer height;
    private List<SegmentDTO> segments;
    private String status;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SegmentDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long startMs;
        private Long endMs;
        /** MaterialCategory 枚举名 */
        private String category;
        private String name;
        private String memo;
        private Long materialClipId;
    }
}
