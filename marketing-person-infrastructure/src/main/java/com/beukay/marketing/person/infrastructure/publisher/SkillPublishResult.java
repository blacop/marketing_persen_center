package com.beukay.marketing.person.infrastructure.publisher;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillPublishResult {

    private String projectArtifactPath;

    private String runtimeArtifactPath;

}
