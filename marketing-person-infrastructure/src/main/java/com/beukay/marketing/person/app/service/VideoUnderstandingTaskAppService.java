package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.BaseFields;
import com.beukay.marketing.person.client.dto.VideoDeconstructionDTO;
import com.beukay.marketing.person.client.dto.VideoDeconstructionTaskDTO;
import com.beukay.marketing.person.client.dto.VideoSegmentDTO;
import com.beukay.marketing.person.domain.productTruth.gateway.ProductTruthGateway;
import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.domain.videoSegment.gateway.VideoSegmentGateway;
import com.beukay.marketing.person.domain.videoSegment.model.VideoSegment;
import com.beukay.marketing.person.infrastructure.service.FfmpegVideoPreprocessor;
import com.beukay.marketing.person.infrastructure.service.LocalTempVideoStorageService;
import com.beukay.marketing.person.infrastructure.service.SkuIdResolver;
import com.beukay.marketing.person.infrastructure.service.VideoUnderstandingAnalyzer;
import com.beukay.marketing.person.infrastructure.service.VideoUnderstandingTaskRegistry;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.beukay.ai.common.exception.GenericBusinessException;
@Service
public class VideoUnderstandingTaskAppService {

    private final VideoUnderstandingTaskRegistry taskRegistry;
    private final ProductTruthGateway productTruthGateway;
    private final FfmpegVideoPreprocessor videoPreprocessor;
    private final VideoUnderstandingAnalyzer videoUnderstandingAnalyzer;
    private final LocalTempVideoStorageService localTempVideoStorageService;
    private final ObjectMapper objectMapper;
    private final SkuIdResolver skuIdResolver;
    private final VideoSegmentGateway videoSegmentGateway;
    private final VideoAnalysisKnowledgeService videoAnalysisKnowledgeService;

    @Autowired
    public VideoUnderstandingTaskAppService(VideoUnderstandingTaskRegistry taskRegistry,
                                            ProductTruthGateway productTruthGateway,
                                            FfmpegVideoPreprocessor videoPreprocessor,
                                            VideoUnderstandingAnalyzer videoUnderstandingAnalyzer,
                                            LocalTempVideoStorageService localTempVideoStorageService,
                                            ObjectMapper objectMapper,
                                            SkuIdResolver skuIdResolver,
                                            VideoSegmentGateway videoSegmentGateway,
                                            VideoAnalysisKnowledgeService videoAnalysisKnowledgeService) {
        this.taskRegistry = taskRegistry;
        this.productTruthGateway = productTruthGateway;
        this.videoPreprocessor = videoPreprocessor;
        this.videoUnderstandingAnalyzer = videoUnderstandingAnalyzer;
        this.localTempVideoStorageService = localTempVideoStorageService;
        this.objectMapper = objectMapper;
        this.skuIdResolver = skuIdResolver;
        this.videoSegmentGateway = videoSegmentGateway;
        this.videoAnalysisKnowledgeService = videoAnalysisKnowledgeService;
    }

    VideoUnderstandingTaskAppService(VideoUnderstandingTaskRegistry taskRegistry,
                                     ProductTruthGateway productTruthGateway,
                                     FfmpegVideoPreprocessor videoPreprocessor,
                                     VideoUnderstandingAnalyzer videoUnderstandingAnalyzer) {
        this(taskRegistry,
                productTruthGateway,
                videoPreprocessor,
                videoUnderstandingAnalyzer,
                null,
                new ObjectMapper(),
                new SkuIdResolver(),
                null,
                null);
    }

    public VideoDeconstructionTaskDTO submitUpload(MultipartFile file, String skuId, String sourceLabel) throws IOException {
        String taskId = nextTaskId();
        Path localPath = localTempVideoStorageService.saveUpload(taskId, file);
        String sourceName = (sourceLabel == null || sourceLabel.isBlank()) ? localPath.getFileName().toString() : sourceLabel;
        return submitLocalFile(taskId, localPath, sourceName, skuId);
    }

    public VideoDeconstructionTaskDTO submitUrl(String videoUrl, String skuId, String sourceLabel) {
        String taskId = nextTaskId();
        String sourceName = (sourceLabel == null || sourceLabel.isBlank()) ? videoUrl : sourceLabel;
        return taskRegistry.submit(taskId, "REMOTE_URL", sourceName, skuId,
                id -> processTask(id, sourceName, skuId, () -> localTempVideoStorageService.downloadRemote(id, videoUrl)));
    }

    public VideoDeconstructionTaskDTO submitLocalFile(Path localVideoPath, String sourceName, String skuId) {
        return submitLocalFile(nextTaskId(), localVideoPath, sourceName, skuId);
    }

    public VideoDeconstructionTaskDTO getTask(String taskId) {
        return taskRegistry.get(taskId);
    }

    private VideoDeconstructionTaskDTO submitLocalFile(String taskId, Path localVideoPath, String sourceName, String skuId) {
        return taskRegistry.submit(taskId, "LOCAL_FILE", sourceName, skuId,
                id -> processTask(id, sourceName, skuId, () -> localVideoPath));
    }

    private void processTask(String taskId, String sourceName, String rawSkuId, ThrowingSupplier<Path> sourceVideoSupplier) {
        try {
            String skuId = skuIdResolver.resolve(rawSkuId);
            taskRegistry.markRunning(taskId, 10, "PREPARING_SOURCE", "正在准备视频源");
            Path sourceVideoPath = sourceVideoSupplier.get();

            taskRegistry.markRunning(taskId, 35, "EXTRACTING_MEDIA", "正在提取关键帧与音频");
            FfmpegVideoPreprocessor.PreparedVideoAssets preparedVideoAssets = videoPreprocessor.prepare(sourceVideoPath);

            taskRegistry.markRunning(taskId, 70, "ANALYZING", "正在进行 ASR + OCR + 多模态分析");
            ProductTruth productTruth = productTruthGateway.queryBySkuId(skuId);
            VideoUnderstandingAnalyzer.VideoUnderstandingAnalysis analysis = videoUnderstandingAnalyzer.analyze(
                    VideoUnderstandingAnalyzer.VideoUnderstandingRequest.builder()
                            .skuId(skuId)
                            .sourceName(sourceName)
                            .productTruth(productTruth)
                            .preparedVideoAssets(preparedVideoAssets)
                            .build());

            taskRegistry.markRunning(taskId, 85, "SAVING_SEGMENTS", "正在持久化片段级拆解结果");
            persistSegments(taskId, skuId, analysis);

            taskRegistry.markRunning(taskId, 90, "SAVING_KNOWLEDGE", "正在写入知识层");
            videoAnalysisKnowledgeService.persistFromAnalysis(taskId, skuId, analysis);
            videoAnalysisKnowledgeService.triggerPatternAggregationAsync(skuId);

            taskRegistry.markRunning(taskId, 95, "ASSEMBLING_RESULT", "正在组装结构化拆解结果");
            VideoDeconstructionDTO result = buildResult(taskId, sourceName, skuId, productTruth, preparedVideoAssets, analysis);
            taskRegistry.markSucceeded(taskId, result, "视频理解拆解完成");
        } catch (Exception ex) {
            taskRegistry.markFailed(taskId, ex.getMessage());
        }
    }

    private VideoDeconstructionDTO buildResult(String taskId,
                                               String sourceName,
                                               String skuId,
                                               ProductTruth productTruth,
                                               FfmpegVideoPreprocessor.PreparedVideoAssets preparedVideoAssets,
                                               VideoUnderstandingAnalyzer.VideoUnderstandingAnalysis analysis) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("taskId", taskId);
        payload.put("sourceName", sourceName);
        payload.put("skuId", skuId);
        payload.put("summary", analysis.getSummary());
        payload.put("transcript", analysis.getTranscript());
        payload.put("ocrTexts", defaultList(analysis.getOcrTexts()));
        payload.put("frameObservations", defaultList(analysis.getFrameObservations()));
        payload.put("hookType", analysis.getHookType());
        payload.put("titlePattern", analysis.getTitlePattern());
        payload.put("sceneTags", defaultList(analysis.getSceneTags()));
        payload.put("sellingPointTags", defaultList(analysis.getSellingPointTags()));
        payload.put("ctaTags", defaultList(analysis.getCtaTags()));
        payload.put("emotionTags", defaultList(analysis.getEmotionTags()));
        payload.put("targetAudienceTags", defaultList(analysis.getTargetAudienceTags()));
        payload.put("reasoning", analysis.getReasoning());
        payload.put("videoDurationSec", preparedVideoAssets.durationSec());

        List<VideoSegmentDTO> segmentDTOs = toSegmentDTOs(analysis.getSegments());
        payload.put("segments", segmentDTOs);

        return VideoDeconstructionDTO.builder()
                .videoId(taskId)
                .skuId(skuId)
                .skuTag(productTruth != null && productTruth.getProductName() != null && !productTruth.getProductName().isBlank()
                        ? productTruth.getProductName()
                        : skuId)
                .hookType(analysis.getHookType())
                .titlePattern(analysis.getTitlePattern())
                .sceneTags(writeJson(defaultList(analysis.getSceneTags())))
                .sellingPointTags(writeJson(defaultList(analysis.getSellingPointTags())))
                .ctaTags(writeJson(defaultList(analysis.getCtaTags())))
                .emotionTags(writeJson(defaultList(analysis.getEmotionTags())))
                .targetAudienceTags(writeJson(defaultList(analysis.getTargetAudienceTags())))
                .deconstructionJson(writeJson(payload))
                .actualPerformanceScore(BigDecimal.ZERO)
                .verificationStatus("TEMP_ANALYZED")
                .status("TEMP")
                .createAt(LocalDateTime.now())
                .segments(segmentDTOs)
                .build();
    }

    private void persistSegments(String taskId, String skuId,
                                 VideoUnderstandingAnalyzer.VideoUnderstandingAnalysis analysis) {
        if (videoSegmentGateway == null) {
            return;
        }
        List<VideoUnderstandingAnalyzer.VideoSegment> raw = analysis.getSegments();
        if (raw == null || raw.isEmpty()) {
            return;
        }
        List<VideoSegment> entities = new ArrayList<>();
        for (VideoUnderstandingAnalyzer.VideoSegment seg : raw) {
            VideoSegment entity = VideoSegment.builder()
                    .taskId(taskId)
                    .videoId(taskId)
                    .skuId(skuId)
                    .segmentIndex(seg.getIndex())
                    .startSec(seg.getStartSec())
                    .endSec(seg.getEndSec())
                    .structureTag(safe(seg.getStructureTag()))
                    .motivation(safe(seg.getMotivation()))
                    .technique(safe(seg.getTechnique()))
                    .cameraLanguage(safe(seg.getCameraLanguage()))
                    .scene(safe(seg.getScene()))
                    .signalStrength(seg.getSignalStrength())
                    .keyPhrase(safe(seg.getKeyPhrase()))
                    .script(seg.getScript())
                    .sellingPoint(safe(seg.getSellingPoint()))
                    .decisiveFrame(seg.isDecisiveFrame())
                    .decisiveFrameDesc(safe(seg.getDecisiveFrameDesc()))
                    .influencerLevel(safe(seg.getInfluencerLevel()))
                    .audiencePersona(safe(seg.getAudiencePersona()))
                    .bgm(safe(seg.getBgm()))
                    .rhythm(safe(seg.getRhythm()))
                    .wardrobe(safe(seg.getWardrobe()))
                    .audio(safe(seg.getAudio()))
                    .skinType(safe(seg.getSkinType()))
                    .trending(safe(seg.getTrending()))
                    .verificationStatus("TEMP")
                    .baseFields(BaseFields.builder()
                            .isDeleted(false)
                            .nezhaTenantCode("")
                            .createBy(0L)
                            .createName("")
                            .updateBy(0L)
                            .updateName("")
                            .createAt(LocalDateTime.now())
                            .updateAt(LocalDateTime.now())
                            .build())
                    .build();
            entities.add(entity);
        }
        videoSegmentGateway.batchCreate(entities);
    }

    private List<VideoSegmentDTO> toSegmentDTOs(List<VideoUnderstandingAnalyzer.VideoSegment> segments) {
        if (segments == null || segments.isEmpty()) {
            return new ArrayList<>();
        }
        List<VideoSegmentDTO> dtos = new ArrayList<>();
        for (VideoUnderstandingAnalyzer.VideoSegment seg : segments) {
            dtos.add(VideoSegmentDTO.builder()
                    .index(seg.getIndex())
                    .startSec(seg.getStartSec())
                    .endSec(seg.getEndSec())
                    .structureTag(seg.getStructureTag())
                    .motivation(seg.getMotivation())
                    .technique(seg.getTechnique())
                    .cameraLanguage(seg.getCameraLanguage())
                    .scene(seg.getScene())
                    .signalStrength(seg.getSignalStrength())
                    .keyPhrase(seg.getKeyPhrase())
                    .script(seg.getScript())
                    .sellingPoint(seg.getSellingPoint())
                    .decisiveFrame(seg.isDecisiveFrame())
                    .decisiveFrameDesc(seg.getDecisiveFrameDesc())
                    .influencerLevel(seg.getInfluencerLevel())
                    .audiencePersona(seg.getAudiencePersona())
                    .bgm(seg.getBgm())
                    .rhythm(seg.getRhythm())
                    .wardrobe(seg.getWardrobe())
                    .audio(seg.getAudio())
                    .skinType(seg.getSkinType())
                    .trending(seg.getTrending())
                    .build());
        }
        return dtos;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private List<?> defaultList(List<?> value) {
        return value == null ? List.of() : value;
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new GenericBusinessException("视频理解结果序列化失败" + ": " + e.getMessage());
        }
    }

    private String nextTaskId() {
        return "video-task-" + UUID.randomUUID();
    }

    @FunctionalInterface
    private interface ThrowingSupplier<T> {
        T get() throws IOException, InterruptedException;
    }
}
