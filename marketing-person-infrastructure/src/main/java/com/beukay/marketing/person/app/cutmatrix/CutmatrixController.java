package com.beukay.marketing.person.app.cutmatrix;

import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.api.CutmatrixFeign;
import com.beukay.marketing.person.client.cmd.CmCollectionCreateCmd;
import com.beukay.marketing.person.client.cmd.CmComposeModeCmd;
import com.beukay.marketing.person.client.cmd.CmParagraphAlignCmd;
import com.beukay.marketing.person.client.cmd.CmSegmentImportCmd;
import com.beukay.marketing.person.client.dto.CmChapterDTO;
import com.beukay.marketing.person.client.dto.CmCollectionDTO;
import com.beukay.marketing.person.client.dto.CmComposeResultDTO;
import com.beukay.marketing.person.client.dto.CmVideoSegmentDTO;
import com.beukay.marketing.person.client.qry.CmCollectionListQry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CutmatrixController implements CutmatrixFeign {

    private final CmCollectionExecutor collectionExecutor;
    private final CmSegmentExecutor segmentExecutor;
    private final CmComposeExecutor composeExecutor;

    @Override
    public Result<CmCollectionDTO> createCollection(CmCollectionCreateCmd cmd) {
        return Result.success(collectionExecutor.create(cmd));
    }

    @Override
    public Result<List<CmCollectionDTO>> listCollections(CmCollectionListQry qry) {
        return Result.success(collectionExecutor.list(qry));
    }

    @Override
    public Result<Boolean> deleteCollection(String collectionCode) {
        return Result.success(collectionExecutor.delete(collectionCode));
    }

    @Override
    public Result<List<CmChapterDTO>> listChapters(String collectionCode) {
        return Result.success(segmentExecutor.listChapters(collectionCode));
    }

    @Override
    public Result<List<CmVideoSegmentDTO>> listSegments(String collectionCode, String chapterCode) {
        return Result.success(segmentExecutor.listSegments(collectionCode, chapterCode));
    }

    @Override
    public Result<Integer> importFromDeconstruction(CmSegmentImportCmd cmd) {
        return Result.success(segmentExecutor.importFromDeconstruction(cmd));
    }

    @Override
    public Result<CmComposeResultDTO> paragraphAlign(CmParagraphAlignCmd cmd) {
        return Result.success(composeExecutor.paragraphAlign(cmd));
    }

    @Override
    public Result<CmComposeResultDTO> sunwukong(CmComposeModeCmd cmd) {
        return Result.success(composeExecutor.sunwukong(cmd.getCollectionCode(), cmd.getDurationSec(), cmd.getNarrationAssetCode(), cmd.getSeed()));
    }

    @Override
    public Result<CmComposeResultDTO> zhuge(CmComposeModeCmd cmd) {
        return Result.success(composeExecutor.zhuge(cmd.getCollectionCode(), cmd.getDurationSec(), cmd.getSeed()));
    }

    @Override
    public Result<CmComposeResultDTO> getComposeResult(String taskCode) {
        return Result.success(composeExecutor.get(taskCode));
    }
}
