package com.beukay.marketing.person.infrastructure.generator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillArtifact {

    private String skillId;

    private String skillContent;

    private String metadataContent;

    private String checksum;

}
