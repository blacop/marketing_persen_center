package com.beukay.marketing.person.infrastructure.generator;

import com.beukay.marketing.person.domain.agentDefinition.model.AgentDefinition;

public interface SkillArtifactGenerator {

    SkillArtifact generate(AgentDefinition definition, String skillId, String publishVersion, String operatorName);

}
