package com.beukay.marketing.person.client.cmd;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentStructureCardGenerateCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank
    private String skuId;

    private String marketingNode;

    private String targetAudience;

    private String accountId;
}
