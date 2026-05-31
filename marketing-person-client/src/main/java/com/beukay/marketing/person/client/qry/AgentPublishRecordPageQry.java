package com.beukay.marketing.person.client.qry;

import com.beukay.ai.common.entity.PageQuery;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * AgentPublishRecord分页查询
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentPublishRecordPageQry implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long definitionId;

    private String publishStatus;

    @Valid
    private PageQuery pageQuery;

}
