package com.beukay.marketing.person.domain.kolPerson.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * KolPerson查询条件
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KolPersonListCriteriaQuery {

    /**
     * 名称
     */
    private String name;

    /**
     * 状态
     */
    private String status;

}
