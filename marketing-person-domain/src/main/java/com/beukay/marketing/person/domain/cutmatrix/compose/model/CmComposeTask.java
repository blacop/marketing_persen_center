package com.beukay.marketing.person.domain.cutmatrix.compose.model;

import com.beukay.ai.common.entity.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CmComposeTask extends Entity<Long> {
    private String taskCode;
    private String collectionCode;
    private String mode;
    private String skuId;
    private String narrationUrl;
    private String sectionsJson;
    private String planJson;
    private BigDecimal totalDurationSec;
    private String resultVideoUrl;
    private String status;
    private String errorMsg;
}
