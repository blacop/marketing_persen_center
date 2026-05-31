package com.beukay.marketing.person.domain.videoDeconstructionResult.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoDeconstructionResultListCriteriaQuery {

    private String skuId;
    private String hookType;
    private String verificationStatus;
}
