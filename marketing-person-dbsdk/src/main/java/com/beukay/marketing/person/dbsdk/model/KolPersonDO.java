package com.beukay.marketing.person.dbsdk.model;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * KolPerson数据对象
 */
@Data
public class KolPersonDO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * id
     */
    private Long id;

    /**
     * 是否删除
     */
    private Integer isDeleted;

    /**
     * 业务租户编码
     */
    private String nezhaTenantCode;

    /**
     * 名称
     */
    private String name;

    /**
     * 描述
     */
    private String description;

    /**
     * 状态
     */
    private String status;

    /**
     * 创建时间
     */
    private LocalDateTime createAt;

    /**
     * 创建人id
     */
    private Long createBy;

    /**
     * 创建人名称
     */
    private String createName;

    /**
     * 更新时间
     */
    private LocalDateTime updateAt;

    /**
     * 更新人id
     */
    private Long updateBy;

    /**
     * 更新人名称
     */
    private String updateName;

}
