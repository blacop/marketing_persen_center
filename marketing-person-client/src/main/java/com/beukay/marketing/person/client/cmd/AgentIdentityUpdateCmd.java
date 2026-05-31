package com.beukay.marketing.person.client.cmd;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentIdentityUpdateCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "id不能为空")
    private Long id;

    @NotBlank(message = "name不能为空")
    private String name;

    private String description;

    private String status;

    @NotBlank(message = "agentUniqueId不能为空")
    private String agentUniqueId;

    private String publicKey;

    private String authPolicy;

    private String ownerId;

    private String agentType;

}
