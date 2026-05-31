package com.beukay.marketing.person.client.composition.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.composition.cmd.ImportChaptersCmd;
import com.beukay.marketing.person.client.composition.cmd.SaveChaptersCmd;
import com.beukay.marketing.person.client.composition.cmd.SubmitRenderCmd;
import com.beukay.marketing.person.client.composition.cmd.UpsertCompositionProjectCmd;
import com.beukay.marketing.person.client.composition.dto.CompositionPlanPreviewDTO;
import com.beukay.marketing.person.client.composition.dto.CompositionProjectDTO;
import com.beukay.marketing.person.client.composition.dto.RenderJobDTO;
import com.beukay.marketing.person.client.composition.qry.CompositionProjectPageQry;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.cloud.openfeign.SpringQueryMap;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "marketing-person-center", contextId = "compositionProjectFeign")
public interface CompositionProjectFeign {

    @PostMapping("/api/composition-projects")
    Result<CompositionProjectDTO> create(@Valid @RequestBody UpsertCompositionProjectCmd cmd);

    @PutMapping("/api/composition-projects/{id}")
    Result<CompositionProjectDTO> update(@PathVariable("id") Long id,
                                         @Valid @RequestBody UpsertCompositionProjectCmd cmd);

    @GetMapping("/api/composition-projects/{id}")
    Result<CompositionProjectDTO> getById(@PathVariable("id") Long id);

    @GetMapping("/api/composition-projects")
    Result<PageInfo<CompositionProjectDTO>> page(@SpringQueryMap @Valid CompositionProjectPageQry qry);

    @DeleteMapping("/api/composition-projects/{id}")
    Result<Void> delete(@PathVariable("id") Long id);

    /** 全量保存项目章节 */
    @PutMapping("/api/composition-projects/{id}/chapters")
    Result<CompositionProjectDTO> saveChapters(@PathVariable("id") Long id,
                                               @Valid @RequestBody SaveChaptersCmd cmd);

    /** FOLDER 模式：从前端上传完成的素材/配音列表导入章节（全量替换） */
    @PostMapping("/api/composition-projects/{id}/import-chapters")
    Result<CompositionProjectDTO> importChapters(@PathVariable("id") Long id,
                                                 @Valid @RequestBody ImportChaptersCmd cmd);

    /** 不渲染，只返 N 条组合方案；count 不传时取项目 targetCount，最大 1000 */
    @GetMapping("/api/composition-projects/{id}/preview")
    Result<CompositionPlanPreviewDTO> preview(@PathVariable("id") Long id,
                                              @RequestParam(value = "count", required = false) Integer count);

    /** 提交渲染（异步，返 RenderJob） */
    @PostMapping("/api/composition-projects/{id}/render")
    Result<RenderJobDTO> submitRender(@PathVariable("id") Long id,
                                      @Valid @RequestBody SubmitRenderCmd cmd);
}
