package com.beukay.marketing.person.client.qry;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 通用ID详情查询
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentTraceDetailQry implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "id不能为空")
    private Long id;

}
