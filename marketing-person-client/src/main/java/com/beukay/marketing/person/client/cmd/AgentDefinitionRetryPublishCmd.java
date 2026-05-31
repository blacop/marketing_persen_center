package com.beukay.marketing.person.client.cmd;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * AgentDefinition重试发布命令
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentDefinitionRetryPublishCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "definitionId不能为空")
    private Long definitionId;

}
