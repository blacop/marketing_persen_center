package com.beukay.marketing.person.client.qry;

import com.beukay.ai.common.entity.PageQuery;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * KolPerson分页查询
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KolPersonPageQry implements Serializable {

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
     * 分页信息
     */
    @Valid
    private PageQuery pageQuery;

}
