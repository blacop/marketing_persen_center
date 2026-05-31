package com.beukay.marketing.person.infrastructure.publisher;

import com.beukay.marketing.person.infrastructure.generator.SkillArtifact;

public interface SkillPublisher {

    SkillPublishResult publish(SkillArtifact artifact);

}
