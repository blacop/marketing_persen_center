package com.beukay.marketing.person.app.cutmatrix;

import com.beukay.ai.common.entity.BaseFields;
import com.beukay.marketing.person.app.cutmatrix.runtime.CmAssetStorageService;
import com.beukay.marketing.person.app.cutmatrix.runtime.CmRenderService;
import com.beukay.marketing.person.infrastructure.service.LocalTempVideoStorageService;
import com.beukay.marketing.person.client.cmd.CmParagraphAlignCmd;
import com.beukay.marketing.person.client.dto.CmComposeResultDTO;
import com.beukay.marketing.person.domain.cutmatrix.compose.gateway.CmComposeTaskGateway;
import com.beukay.marketing.person.domain.cutmatrix.compose.model.CmComposeTask;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Log4j2
public class CmComposeExecutor {

    private final CmParagraphAlignEngine engine;
    private final CmZhugeSunwukongEngine zsEngine;
    private final CmComposeTaskGateway taskGateway;
    private final CmRenderService renderService;
    private final CmAssetStorageService storage;
    private final LocalTempVideoStorageService localVideoStorage;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public CmComposeResultDTO paragraphAlign(CmParagraphAlignCmd cmd) {
        CmComposeResultDTO result = engine.align(cmd);
        String taskCode = "cmt-" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        result.setTaskCode(taskCode);
        renderAndUpdate(result, cmd.getNarrationUrl());
        persistTask(taskCode, cmd.getCollectionCode(), "PARAGRAPH_ALIGN", cmd.getSkuId(), cmd.getNarrationUrl(),
                cmd.getSections(), result);
        return result;
    }

    public CmComposeResultDTO sunwukong(String collectionCode, double totalDurationSec, String narrationAssetCode, Long seed) {
        long s = seed == null ? System.currentTimeMillis() : seed;
        CmComposeResultDTO result = zsEngine.sunwukong(collectionCode, totalDurationSec, s);
        String taskCode = "cmt-" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        result.setTaskCode(taskCode);
        renderAndUpdate(result, narrationAssetCode);
        persistTask(taskCode, collectionCode, "SUNWUKONG", null, narrationAssetCode, null, result);
        return result;
    }

    public CmComposeResultDTO zhuge(String collectionCode, double secPerChapter, Long seed) {
        long s = seed == null ? System.currentTimeMillis() : seed;
        CmComposeResultDTO result = zsEngine.zhuge(collectionCode, secPerChapter, s);
        String taskCode = "cmt-" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        result.setTaskCode(taskCode);
        renderAndUpdate(result, null);
        persistTask(taskCode, collectionCode, "ZHUGE", null, null, null, result);
        return result;
    }

    private void renderAndUpdate(CmComposeResultDTO result, String narrationAssetCode) {
        if (result.getClips() == null || result.getClips().isEmpty()) return;
        List<CmRenderService.ClipSpec> specs = new ArrayList<>();
        for (var c : result.getClips()) {
            Path src = resolveAsset(c.getSegmentCode(), c.getVideoUrl());
            if (src == null) {
                log.warn("[Compose] cannot resolve clip src code={} url={}", c.getSegmentCode(), c.getVideoUrl());
                continue;
            }
            specs.add(CmRenderService.ClipSpec.ofPath(src,
                    c.getStartSec().doubleValue(),
                    c.getEndSec().doubleValue()));
        }
        if (specs.isEmpty()) {
            result.setStatus("FAILED");
            result.setErrorMsg("no clip src resolvable to local path; only DECONSTRUCTION-sourced (cm asset) clips can be rendered locally");
            return;
        }
        try {
            var outcome = renderService.concatClips(specs, narrationAssetCode, CmRenderService.RenderOpts.portrait1080());
            if (outcome.ok()) {
                result.setStatus("SUCCEEDED");
                result.setResultVideoUrl(outcome.streamUrl());
                result.setTotalDurationSec(BigDecimal.valueOf(outcome.durationSec()).setScale(3, java.math.RoundingMode.HALF_UP));
            } else {
                result.setStatus("FAILED");
                result.setErrorMsg(outcome.errorMsg());
            }
        } catch (IOException | InterruptedException e) {
            result.setStatus("FAILED");
            result.setErrorMsg("render exception: " + e.getMessage());
            log.error("[Compose] render failed", e);
        }
    }

    private Path resolveAsset(String segmentCode, String videoUrl) {
        // 1. 优先从 cm asset 解析（本地存储）
        if (videoUrl != null && videoUrl.contains("/cm/asset/stream/")) {
            String code = videoUrl.substring(videoUrl.lastIndexOf('/') + 1);
            Path p = storage.resolveAssetByCode(code);
            if (p != null) return p;
        }
        // 2. /videoUnderstanding/stream/{taskId} —— 走 LocalTempVideoStorage findSourceVideo
        if (videoUrl != null && videoUrl.contains("/videoUnderstanding/stream/")) {
            String videoId = videoUrl.substring(videoUrl.lastIndexOf('/') + 1);
            return localVideoStorage.findSourceVideo(videoId).orElse(null);
        }
        return null;
    }

    private void persistTask(String taskCode, String collectionCode, String mode, String skuId,
                             String narrationUrl, Object sections, CmComposeResultDTO result) {
        try {
            CmComposeTask task = CmComposeTask.builder()
                    .taskCode(taskCode)
                    .collectionCode(collectionCode)
                    .mode(mode)
                    .skuId(skuId)
                    .narrationUrl(narrationUrl)
                    .sectionsJson(sections == null ? null : MAPPER.writeValueAsString(sections))
                    .planJson(MAPPER.writeValueAsString(result.getClips()))
                    .totalDurationSec(result.getTotalDurationSec())
                    .resultVideoUrl(result.getResultVideoUrl())
                    .status(result.getStatus())
                    .errorMsg(result.getErrorMsg())
                    .baseFields(BaseFields.builder()
                            .isDeleted(false)
                            .nezhaTenantCode("")
                            .createBy(0L).createName("")
                            .updateBy(0L).updateName("")
                            .createAt(LocalDateTime.now())
                            .updateAt(LocalDateTime.now())
                            .build())
                    .build();
            taskGateway.save(task);
        } catch (JsonProcessingException e) {
            log.warn("[Compose] failed to persist task json: {}", e.getMessage());
        }
    }

    public CmComposeResultDTO get(String taskCode) {
        CmComposeTask task = taskGateway.getByCode(taskCode);
        if (task == null) return null;
        try {
            CmComposeResultDTO dto = CmComposeResultDTO.builder()
                    .taskCode(task.getTaskCode())
                    .collectionCode(task.getCollectionCode())
                    .mode(task.getMode())
                    .status(task.getStatus())
                    .totalDurationSec(task.getTotalDurationSec())
                    .resultVideoUrl(task.getResultVideoUrl())
                    .errorMsg(task.getErrorMsg())
                    .build();
            if (task.getPlanJson() != null) {
                dto.setClips(MAPPER.readValue(task.getPlanJson(),
                        MAPPER.getTypeFactory().constructCollectionType(java.util.List.class, CmComposeResultDTO.Clip.class)));
            }
            return dto;
        } catch (JsonProcessingException e) {
            log.warn("[Compose] failed to parse plan json: {}", e.getMessage());
            return null;
        }
    }
}
