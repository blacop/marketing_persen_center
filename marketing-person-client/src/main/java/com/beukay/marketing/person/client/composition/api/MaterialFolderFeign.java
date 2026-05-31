package com.beukay.marketing.person.client.composition.api;

import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.composition.cmd.CreateMaterialFolderCmd;
import com.beukay.marketing.person.client.composition.cmd.UpdateMaterialFolderCmd;
import com.beukay.marketing.person.client.composition.dto.MaterialFolderDTO;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

/** 素材分类文件夹 API */
@FeignClient(name = "marketing-person-center", contextId = "materialFolderFeign")
public interface MaterialFolderFeign {

    @GetMapping("/api/material-folders")
    Result<List<MaterialFolderDTO>> list();

    @PostMapping("/api/material-folders")
    Result<MaterialFolderDTO> create(@Valid @RequestBody CreateMaterialFolderCmd cmd);

    @PutMapping("/api/material-folders/{id}")
    Result<MaterialFolderDTO> update(@PathVariable("id") Long id,
                                     @Valid @RequestBody UpdateMaterialFolderCmd cmd);

    @DeleteMapping("/api/material-folders/{id}")
    Result<Void> delete(@PathVariable("id") Long id);
}
