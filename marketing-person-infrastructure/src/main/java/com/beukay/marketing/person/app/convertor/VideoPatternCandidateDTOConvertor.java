package com.beukay.marketing.person.app.convertor;

import com.beukay.marketing.person.client.dto.VideoPatternCandidateDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.util.Map;

@Mapper
public interface VideoPatternCandidateDTOConvertor {

    VideoPatternCandidateDTOConvertor INSTANCE = Mappers.getMapper(VideoPatternCandidateDTOConvertor.class);

    default VideoPatternCandidateDTO convert(Map<String, Object> source) {
        return VideoPatternCandidateDTO.builder()
                .patternCode(stringValue(source.get("patternCode")))
                .patternName(stringValue(source.get("patternName")))
                .matchScore(decimalValue(source.get("matchScore")))
                .reasonJson(stringValue(source.get("reasonJson") != null ? source.get("reasonJson") : source.get("reason")))
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
