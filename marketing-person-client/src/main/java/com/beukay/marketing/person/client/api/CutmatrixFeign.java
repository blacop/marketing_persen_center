package com.beukay.marketing.person.client.api;

import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.cmd.CmCollectionCreateCmd;
import com.beukay.marketing.person.client.cmd.CmParagraphAlignCmd;
import com.beukay.marketing.person.client.cmd.CmSegmentImportCmd;
import com.beukay.marketing.person.client.dto.CmChapterDTO;
import com.beukay.marketing.person.client.dto.CmCollectionDTO;
import com.beukay.marketing.person.client.dto.CmComposeResultDTO;
import com.beukay.marketing.person.client.dto.CmVideoSegmentDTO;
import com.beukay.marketing.person.client.qry.CmCollectionListQry;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * 视频矩阵 (Cutmatrix) API.
 * 与 ScriptBlueprintFeign / VideoAssemblyFeign 完全隔离的命名空间 /cm/*.
 */
public interface CutmatrixFeign {

    // ─── 素材库（品名/章节/片段） ─────────────────────────────
    @PostMapping("/cm/collection/create")
    Result<CmCollectionDTO> createCollection(@RequestBody @Valid CmCollectionCreateCmd cmd);

    @PostMapping("/cm/collection/list")
    Result<List<CmCollectionDTO>> listCollections(@RequestBody CmCollectionListQry qry);

    @PostMapping("/cm/collection/delete")
    Result<Boolean> deleteCollection(@RequestParam String collectionCode);

    @PostMapping("/cm/chapter/list")
    Result<List<CmChapterDTO>> listChapters(@RequestParam String collectionCode);

    @PostMapping("/cm/segment/list")
    Result<List<CmVideoSegmentDTO>> listSegments(@RequestParam String collectionCode,
                                                  @RequestParam(required = false) String chapterCode);

    @PostMapping("/cm/segment/importFromDeconstruction")
    Result<Integer> importFromDeconstruction(@RequestBody @Valid CmSegmentImportCmd cmd);

    // ─── 编排（段落对齐 / 孙悟空 / 诸葛亮） ───────────────────
    @PostMapping("/cm/compose/paragraphAlign")
    Result<CmComposeResultDTO> paragraphAlign(@RequestBody @Valid CmParagraphAlignCmd cmd);

    @PostMapping("/cm/compose/sunwukong")
    Result<CmComposeResultDTO> sunwukong(@RequestBody @Valid com.beukay.marketing.person.client.cmd.CmComposeModeCmd cmd);

    @PostMapping("/cm/compose/zhuge")
    Result<CmComposeResultDTO> zhuge(@RequestBody @Valid com.beukay.marketing.person.client.cmd.CmComposeModeCmd cmd);

    @PostMapping("/cm/compose/get")
    Result<CmComposeResultDTO> getComposeResult(@RequestParam String taskCode);
}
