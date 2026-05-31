package com.beukay.marketing.person.client.qry;

import com.beukay.ai.common.entity.PageQuery;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentPatternKnowledgePageQry implements Serializable {

    private static final long serialVersionUID = 1L;

    private String skuId;

    private String marketingNode;

    private String hookType;

    private String verificationStatus;

    @Valid
    private PageQuery pageQuery;
}
