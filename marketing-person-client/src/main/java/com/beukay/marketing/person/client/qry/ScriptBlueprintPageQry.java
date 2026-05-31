package com.beukay.marketing.person.client.qry;

import com.beukay.ai.common.entity.PageQuery;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 脚本蓝图分页查询
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScriptBlueprintPageQry implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 商品 ID */
    private String skuId;

    /** 营销目标 */
    private String marketingGoal;

    /** 投放平台 */
    private String platform;

    /** 蓝图状态 */
    private String status;

    /** 分页参数 */
    @Valid
    private PageQuery pageQuery;
}
