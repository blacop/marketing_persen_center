package com.beukay.marketing.person.app.service;

import com.beukay.ai.common.entity.Operator;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprint;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprintSection;
import com.beukay.marketing.person.domain.scriptBlueprint.gateway.ScriptBlueprintGateway;
import com.beukay.marketing.person.domain.scriptBlueprint.gateway.ScriptBlueprintSectionGateway;
import com.beukay.marketing.person.domain.videoAssembly.ability.VideoAssemblyTaskDomainService;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyCandidateGateway;
import com.beukay.marketing.person.domain.videoAssembly.gateway.VideoAssemblyPlanGateway;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyCandidate;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyPlan;
import com.beukay.marketing.person.domain.videoAssembly.model.VideoAssemblyTask;
import com.beukay.marketing.person.domain.videoSegment.gateway.VideoSegmentGateway;
import com.beukay.marketing.person.domain.videoSegment.model.VideoSegment;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.beukay.ai.common.exception.GenericBusinessException;
@Service
@RequiredArgsConstructor
public class VideoAssemblyGenerateAppService {
    private static final Operator SYSTEM_OPERATOR = new Operator(0L, "system");
    private final VideoAssemblyTaskDomainService videoAssemblyTaskDomainService;
    private final VideoAssemblyCandidateGateway videoAssemblyCandidateGateway;
    private final VideoAssemblyPlanGateway videoAssemblyPlanGateway;
    private final ScriptBlueprintGateway scriptBlueprintGateway;
    private final ScriptBlueprintSectionGateway scriptBlueprintSectionGateway;
    private final VideoSegmentGateway videoSegmentGateway;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public VideoAssemblyTask generate(String blueprintCode) {
        ScriptBlueprint blueprint = scriptBlueprintGateway.queryByBlueprintCode(blueprintCode);
        List<ScriptBlueprintSection> sections = scriptBlueprintSectionGateway.listByBlueprintCode(blueprintCode);
        List<VideoSegment> segments = videoSegmentGateway.listBySkuId(blueprint.getSkuId());

        String taskCode = "vat-" + UUID.randomUUID().toString().replace("-", "");
        List<VideoAssemblyCandidate> candidateEntities = new ArrayList<>();
        List<VideoAssemblyPlan> planEntities = new ArrayList<>();
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("blueprintCode", blueprintCode);
        summary.put("sectionCount", sections.size());
        summary.put("segmentPoolSize", segments.size());

        for (ScriptBlueprintSection section : sections) {
            List<VideoSegmentMatch> matches = new ArrayList<>(segments.stream()
                    .map(segment -> new VideoSegmentMatch(segment, similarityScore(section, segment)))
                    .filter(match -> match.score().compareTo(BigDecimal.ZERO) > 0)
                    .sorted(Comparator.comparing(VideoSegmentMatch::score).reversed()
                            .thenComparing(match -> match.segment().getSignalStrength(), Comparator.reverseOrder()))
                    .limit(2)
                    .toList());
            if (matches.size() < 2) {
                segments.stream()
                        .filter(segment -> matches.stream().noneMatch(existing -> existing.segment().getId().equals(segment.getId())))
                        .sorted(Comparator.comparing(VideoSegment::getSignalStrength).reversed()
                                .thenComparing(VideoSegment::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                        .limit(2 - matches.size())
                        .map(segment -> new VideoSegmentMatch(segment, new BigDecimal("0.010000")))
                        .forEach(matches::add);
            }
            for (int i = 0; i < matches.size(); i++) {
                VideoSegmentMatch match = matches.get(i);
                VideoAssemblyCandidate candidate = VideoAssemblyCandidate.builder()
                        .taskCode(taskCode)
                        .sectionNo(section.getSectionNo())
                        .segmentId(match.segment().getId())
                        .videoId(match.segment().getVideoId())
                        .similarityScore(match.score())
                        .matchReasonJson(writeJson(buildMatchReason(section, match.segment(), match.score())))
                        .rankNo(i + 1)
                        .selected(i == 0)
                        .build();
                candidate.buildInsert(SYSTEM_OPERATOR);
                candidateEntities.add(candidate);
            }
            if (!matches.isEmpty()) {
                VideoSegmentMatch selected = matches.getFirst();
                VideoAssemblyPlan plan = VideoAssemblyPlan.builder()
                        .taskCode(taskCode)
                        .sectionNo(section.getSectionNo())
                        .segmentId(selected.segment().getId())
                        .videoId(selected.segment().getVideoId())
                        .selectionReasonJson(writeJson(buildSelectionReason(section, selected.segment(), selected.score())))
                        .build();
                plan.buildInsert(SYSTEM_OPERATOR);
                planEntities.add(plan);
            }
        }

        VideoAssemblyTask task = VideoAssemblyTask.builder()
                .taskCode(taskCode)
                .blueprintCode(blueprintCode)
                .status("READY")
                .platform(blueprint.getPlatform())
                .targetDuration(planEntities.size() * 8)
                .interventionStatus("AUTO")
                .summaryJson(writeJson(summary))
                .build();
        task.buildInsert(SYSTEM_OPERATOR);
        Long id = videoAssemblyTaskDomainService.create(task);
        task.setId(id);

        videoAssemblyCandidateGateway.batchCreate(candidateEntities);
        videoAssemblyPlanGateway.batchCreate(planEntities);
        return task;
    }

    private BigDecimal similarityScore(ScriptBlueprintSection section, VideoSegment segment) {
        Set<String> sectionTokens = tokenize(section.getQueryText());
        sectionTokens.addAll(tokenize(section.getMustCoverJson()));
        Set<String> preferredTokens = tokenize(section.getPreferredSignalsJson());
        Set<String> avoidTokens = tokenize(section.getAvoidSignalsJson());
        Set<String> segmentTokens = buildSegmentTokens(segment);
        if (sectionTokens.isEmpty() || segmentTokens.isEmpty()) {
            return BigDecimal.ZERO;
        }
        long overlap = sectionTokens.stream().filter(segmentTokens::contains).count();
        if (overlap == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal base = BigDecimal.valueOf(overlap)
                .divide(BigDecimal.valueOf(sectionTokens.size()), 6, RoundingMode.HALF_UP);
        BigDecimal signalBonus = BigDecimal.valueOf(segment.getSignalStrength()).divide(BigDecimal.TEN, 6, RoundingMode.HALF_UP);
        BigDecimal preferredBonus = BigDecimal.valueOf(preferredTokens.stream().filter(segmentTokens::contains).count())
                .multiply(new BigDecimal("0.080000"));
        BigDecimal avoidPenalty = BigDecimal.valueOf(avoidTokens.stream().filter(segmentTokens::contains).count())
                .multiply(new BigDecimal("0.120000"));
        return base.add(signalBonus).add(preferredBonus).subtract(avoidPenalty)
                .max(BigDecimal.ZERO)
                .setScale(6, RoundingMode.HALF_UP);
    }

    private Map<String, Object> buildMatchReason(ScriptBlueprintSection section, VideoSegment segment, BigDecimal score) {
        Set<String> segmentTokens = buildSegmentTokens(segment);
        List<String> matchedTokens = tokenize(section.getQueryText()).stream().filter(segmentTokens::contains).toList();
        List<String> preferredSignalHits = tokenize(section.getPreferredSignalsJson()).stream().filter(segmentTokens::contains).toList();
        List<String> avoidSignalHits = tokenize(section.getAvoidSignalsJson()).stream().filter(segmentTokens::contains).toList();
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("sectionNo", section.getSectionNo());
        json.put("stageCode", section.getStageCode());
        json.put("segmentId", segment.getId());
        json.put("videoId", segment.getVideoId());
        json.put("similarityScore", score);
        json.put("matchedTokens", matchedTokens);
        json.put("preferredSignalHits", preferredSignalHits);
        json.put("avoidSignalHits", avoidSignalHits);
        json.put("retrievalStrategy", "RULE_VECTOR_READY_V1");
        return json;
    }

    private Map<String, Object> buildSelectionReason(ScriptBlueprintSection section, VideoSegment segment, BigDecimal score) {
        Map<String, Object> json = buildMatchReason(section, segment, score);
        json.put("selectedReason", "rank-1-by-rule-score");
        return json;
    }

    private Set<String> tokenize(String raw) {
        if (!StringUtils.hasText(raw)) {
            return new LinkedHashSet<>();
        }
        String normalized = raw.replace("[", " ").replace("]", " ").replace("\"", " ")
                .replace(",", " ").replace("，", " ").replace("/", " ").replace("_", " ");
        String[] pieces = normalized.split("\\s+");
        Set<String> result = new LinkedHashSet<>();
        for (String piece : pieces) {
            if (piece != null && !piece.isBlank() && piece.length() >= 2) {
                result.add(piece.trim());
            }
        }
        return result;
    }

    private Set<String> buildSegmentTokens(VideoSegment segment) {
        Set<String> segmentTokens = new LinkedHashSet<>();
        segmentTokens.addAll(tokenize(segment.getSellingPoint()));
        segmentTokens.addAll(tokenize(segment.getScene()));
        segmentTokens.addAll(tokenize(segment.getScript()));
        segmentTokens.addAll(tokenize(segment.getKeyPhrase()));
        segmentTokens.addAll(tokenize(segment.getStructureTag()));
        segmentTokens.addAll(tokenize(segment.getRhythm()));
        segmentTokens.addAll(tokenize(segment.getMotivation()));
        segmentTokens.addAll(tokenize(segment.getTechnique()));
        segmentTokens.addAll(tokenize(segment.getCameraLanguage()));
        segmentTokens.addAll(tokenize(segment.getAudiencePersona()));
        segmentTokens.addAll(tokenize(segment.getTrending()));
        return segmentTokens;
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new GenericBusinessException("VideoAssembly JSON序列化失败" + ": " + e.getMessage());
        }
    }

    private record VideoSegmentMatch(VideoSegment segment, BigDecimal score) {
    }
}
