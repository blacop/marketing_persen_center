package com.beukay.marketing.person.client.cmd;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * 从拆解结果导入素材到 cm_video_segment.
 * 后端会按 stage_code 自动归章节。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CmSegmentImportCmd implements Serializable {
    private static final long serialVersionUID = 1L;
    @NotBlank
    private String collectionCode;
    @NotNull
    private List<String> deconstructionIds;
}
