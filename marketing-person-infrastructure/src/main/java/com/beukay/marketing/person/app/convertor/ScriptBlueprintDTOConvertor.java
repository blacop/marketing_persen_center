package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.ScriptBlueprintDTO;
import com.beukay.marketing.person.client.dto.ScriptTemplateCandidateDTO;
import com.beukay.marketing.person.domain.scriptBlueprint.model.ScriptBlueprint;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Mapper
public interface ScriptBlueprintDTOConvertor {
    ScriptBlueprintDTOConvertor INSTANCE = Mappers.getMapper(ScriptBlueprintDTOConvertor.class);
    ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    default ScriptBlueprintDTO convert(ScriptBlueprint source) {
        return ScriptBlueprintDTO.builder()
                .id(source.getId())
                .blueprintCode(source.getBlueprintCode())
                .skuId(source.getSkuId())
                .recommendedTemplateCode(source.getRecommendedTemplateCode())
                .recommendedTemplateName(source.getRecommendedTemplateName())
                .recommendedTemplateReason(source.getRecommendedTemplateReason())
                .templateCandidatesJson(source.getTemplateCandidatesJson())
                .autoFlowStatus(source.getAutoFlowStatus())
                .templateCandidates(parseTemplateCandidates(source.getTemplateCandidatesJson()))
                .build();
    }

    private List<ScriptTemplateCandidateDTO> parseTemplateCandidates(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            List<Map<String, Object>> candidates = OBJECT_MAPPER.readValue(json, new TypeReference<>() { });
            return candidates.stream().map(this::toCandidate).toList();
        } catch (Exception ex) {
            return List.of();
        }
    }

    private ScriptTemplateCandidateDTO toCandidate(Map<String, Object> source) {
        return ScriptTemplateCandidateDTO.builder()
                .templateCode(stringValue(source.get("templateCode")))
                .templateName(stringValue(source.get("templateName")))
                .matchScore(decimalValue(source.get("matchScore")))
                .reasonJson(stringValue(source.get("reasonJson")))
                .rankNo(integerValue(source.get("rankNo")))
                .recommended(booleanValue(source.get("recommended")))
                .build();
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Integer integerValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.parseInt(String.valueOf(value));
    }

    private Boolean booleanValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        if (value instanceof Number number) {
            return number.intValue() == 1;
        }
        return Boolean.parseBoolean(String.valueOf(value));
    }

    private BigDecimal decimalValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof BigDecimal bigDecimal) {
            return bigDecimal;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return new BigDecimal(String.valueOf(value));
    }
}
