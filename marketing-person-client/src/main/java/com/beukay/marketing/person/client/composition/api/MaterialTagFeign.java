package com.beukay.marketing.person.client.composition.api;

import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.composition.cmd.CreateMaterialTagCmd;
import com.beukay.marketing.person.client.composition.dto.MaterialTagDTO;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/** 素材标签 API */
@FeignClient(name = "marketing-person-center", contextId = "materialTagFeign")
public interface MaterialTagFeign {

    /** 列表（可按 category 过滤） */
    @GetMapping("/api/material-tags")
    Result<List<MaterialTagDTO>> list(@RequestParam(value = "category", required = false) String category);

    /** 创建（同 name+category 已存在则返回原 ID） */
    @PostMapping("/api/material-tags")
    Result<MaterialTagDTO> create(@Valid @RequestBody CreateMaterialTagCmd cmd);

    /** 软删除 */
    @DeleteMapping("/api/material-tags/{id}")
    Result<Void> delete(@PathVariable("id") Long id);
}
