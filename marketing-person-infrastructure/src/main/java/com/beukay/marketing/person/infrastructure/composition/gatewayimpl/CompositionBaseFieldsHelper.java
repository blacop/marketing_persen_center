package com.beukay.marketing.person.infrastructure.composition.gatewayimpl;

import com.beukay.ai.common.entity.BaseFields;

import java.time.LocalDateTime;

/**
 * 在没有登录上下文时为合成聚合实体兜底初始化 baseFields。
 * 真实登录上下文下应由 BaseFields() 默认构造从 UserLoginHolder / TenantHolder 取值。
 */
final class CompositionBaseFieldsHelper {

    private CompositionBaseFieldsHelper() {}

    static BaseFields fallbackForInsert() {
        LocalDateTime now = LocalDateTime.now();
        return BaseFields.builder()
                .nezhaTenantCode("default")
                .isDeleted(Boolean.FALSE)
                .createAt(now)
                .createBy(0L)
                .createName("system")
                .updateAt(now)
                .updateBy(0L)
                .updateName("system")
                .build();
    }
}
