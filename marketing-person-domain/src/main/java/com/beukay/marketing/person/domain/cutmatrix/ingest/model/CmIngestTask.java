package com.beukay.marketing.person.domain.cutmatrix.ingest.model;

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
public class CmIngestTask extends Entity<Long> {
    private String taskCode;
    private String sourceUrl;
    private String title;
    private String coverAssetCode;
    private String videoAssetCode;
    private String audioAssetCode;
    private BigDecimal durationSec;
    private Integer width;
    private Integer height;
    private String qualityLabel;
    private String downloadStatus;
    private String downloadError;
    private String scriptText;
    private String scriptStatus;
    private String scriptError;
    private Integer autoStripEmoji;
}
