package com.beukay.marketing.person.domain.scriptBlueprint.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 脚本蓝图分页查询条件
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScriptBlueprintCriteria {

    /** 商品 ID */
    private String skuId;

    /** 营销目标 */
    private String marketingGoal;

    /** 投放平台 */
    private String platform;

    /** 蓝图状态 */
    private String status;

    /** 当前页码（1-based） */
    private long pageIndex;

    /** 每页大小 */
    private long pageSize;
}
