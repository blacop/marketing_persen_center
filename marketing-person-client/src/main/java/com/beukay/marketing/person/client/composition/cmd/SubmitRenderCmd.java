package com.beukay.marketing.person.client.composition.cmd;

import com.beukay.marketing.person.client.composition.dto.RenderConfigDTO;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/** 提交渲染（覆盖项目级 targetCount，可选） */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitRenderCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 本次渲染条数；不传则用项目 targetCount */
    @Min(1) @Max(1000)
    private Integer count;

    /** 渲染配置；不传则全部按默认（项目分辨率 + 旧版 ffmpeg 流水线） */
    private RenderConfigDTO renderConfig;

    /**
     * 选中的 planHash 列表；非空时只渲染这些组合（前端 preview 后的子集）。
     * 空时按 count 渲染前 N 条。
     */
    private List<String> selectedPlanHashes;
}
