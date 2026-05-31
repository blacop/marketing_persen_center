package com.beukay.marketing.person.domain.shared;

/**
 * 领域事件发布者
 *
 * @author huawei
 * @date 2022/04/08
 */
public interface DomainEventPublisher {

    /**
     * 发布者身份识别
     *
     * @return
     */
    String identifier();
}
