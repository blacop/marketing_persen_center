package com.beukay.marketing.person.client.composition.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.composition.cmd.CreateSourceVideoCmd;
import com.beukay.marketing.person.client.composition.cmd.ImportSourceVideoFromUrlCmd;
import com.beukay.marketing.person.client.composition.cmd.UpdateSegmentsCmd;
import com.beukay.marketing.person.client.composition.dto.SourceVideoDTO;
import com.beukay.marketing.person.client.composition.qry.SourceVideoPageQry;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.cloud.openfeign.SpringQueryMap;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

/** 视频拆解 - 源视频 API */
@FeignClient(name = "marketing-person-center", contextId = "sourceVideoFeign")
public interface SourceVideoFeign {

    @PostMapping("/api/source-videos")
    Result<SourceVideoDTO> create(@Valid @RequestBody CreateSourceVideoCmd cmd);

    /** 通过 URL 导入：后端下载视频到本地 → 入库 */
    @PostMapping("/api/source-videos/import-url")
    Result<SourceVideoDTO> importFromUrl(@Valid @RequestBody ImportSourceVideoFromUrlCmd cmd);

    @GetMapping("/api/source-videos")
    Result<PageInfo<SourceVideoDTO>> page(@SpringQueryMap @Valid SourceVideoPageQry qry);

    @GetMapping("/api/source-videos/{id}")
    Result<SourceVideoDTO> getById(@PathVariable("id") Long id);

    @PutMapping("/api/source-videos/{id}/segments")
    Result<SourceVideoDTO> updateSegments(@PathVariable("id") Long id,
                                          @Valid @RequestBody UpdateSegmentsCmd cmd);

    /** 按 segments 切片导出 → 入素材库；返回最新源视频（含 materialClipId 回填到每个片段） */
    @PostMapping("/api/source-videos/{id}/split")
    Result<SourceVideoDTO> exportSplit(@PathVariable("id") Long id);

    /** 自动拆解：抽音轨 → 调 ASR → LLM 归类 → 写入 segments */
    @PostMapping("/api/source-videos/{id}/auto-split")
    Result<SourceVideoDTO> autoSplit(@PathVariable("id") Long id);

    @DeleteMapping("/api/source-videos/{id}")
    Result<Void> delete(@PathVariable("id") Long id);
}
