package com.beukay.marketing.person.client.qry;

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
public class AgentRegistryUniqueIdQry implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "agentUniqueId不能为空")
    private String agentUniqueId;

}
