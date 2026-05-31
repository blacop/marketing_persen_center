package com.beukay.marketing.person.infrastructure.composition.gatewayimpl;

import com.beukay.marketing.person.domain.composition.model.MaterialTag;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 章节 tag_filter JSON 列编解码助手。
 * JSON 形式：[{"id":1,"name":"痛点","category":"动机"}, ...]
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class ChapterTagFilterCodec {

    private static final TypeReference<List<MaterialTag>> LIST_TYPE = new TypeReference<>() {};

    private final ObjectMapper objectMapper;

    public String encode(List<MaterialTag> tags) {
        if (tags == null || tags.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(tags);
        } catch (JsonProcessingException e) {
            log.warn("[chapter] encode tag_filter failed", e);
            return "[]";
        }
    }

    public List<MaterialTag> decode(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, LIST_TYPE);
        } catch (JsonProcessingException e) {
            log.warn("[chapter] decode tag_filter failed: {}", json, e);
            return List.of();
        }
    }
}
