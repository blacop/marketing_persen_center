package com.beukay.marketing.person.client.composition.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.composition.dto.RenderJobDTO;
import com.beukay.marketing.person.client.composition.dto.RenderOutputDTO;
import com.beukay.marketing.person.client.composition.qry.RenderJobPageQry;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.cloud.openfeign.SpringQueryMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@FeignClient(name = "marketing-person-center", contextId = "renderJobFeign")
public interface RenderJobFeign {

    @GetMapping("/api/render-jobs")
    Result<PageInfo<RenderJobDTO>> page(@SpringQueryMap @Valid RenderJobPageQry qry);

    @GetMapping("/api/render-jobs/{id}")
    Result<RenderJobDTO> getById(@PathVariable("id") Long id);

    @GetMapping("/api/render-jobs/{id}/outputs")
    Result<List<RenderOutputDTO>> listOutputs(@PathVariable("id") Long id);

    /** 取消（仅 PENDING / RUNNING 时有效） */
    @PostMapping("/api/render-jobs/{id}/cancel")
    Result<Void> cancel(@PathVariable("id") Long id);
}
