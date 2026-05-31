package com.beukay.marketing.person.client.cmd;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * AgentDefinition更新命令
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentDefinitionUpdateCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "id不能为空")
    private Long id;

    @NotBlank(message = "name不能为空")
    private String name;

    private String description;

    private String status;

    @NotBlank(message = "agentDefId不能为空")
    private String agentDefId;

    @NotBlank(message = "behaviorDsl不能为空")
    private String behaviorDsl;

    private String modelConfig;

    private String businessRules;

    private String skillIds;

    private String version;

}
