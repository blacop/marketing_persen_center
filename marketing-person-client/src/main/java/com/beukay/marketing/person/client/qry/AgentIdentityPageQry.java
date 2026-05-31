package com.beukay.marketing.person.client.qry;

import com.beukay.ai.common.entity.PageQuery;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 智能体身份分页查询
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentIdentityPageQry implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 名称
     */
    private String name;

    /**
     * 状态
     */
    private String status;

    /**
     * 智能体类型(HUMAN/MACHINE/HYBRID)
     */
    private String agentType;

    /**
     * 所属团队/人员ID
     */
    private String ownerId;

    /**
     * 分页信息
     */
    @Valid
    private PageQuery pageQuery;

}
