package com.beukay.marketing.person.infrastructure.event.springevent;

import cn.hutool.core.text.StrFormatter;
import com.beukay.marketing.person.domain.shared.DomainEvent;
import com.beukay.marketing.person.domain.shared.DomainEventPublisher;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationEventPublisherAware;

/**
 * Spring 事件发布
 *
 * @author huawei
 * @date 2022/09/08
 */
@Log4j2
public abstract class SpringDomainEventPublisher<T extends DomainEvent> implements DomainEventPublisher,
        ApplicationEventPublisherAware {

    private static ApplicationEventPublisher eventPublisher;

    @Override
    public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        if (eventPublisher == null) {
            eventPublisher = applicationEventPublisher;
        }
    }

    public void publish(T event) {
        log.info(StrFormatter.format("[事件-{}]已发送", event.identifier()));
        eventPublisher.publishEvent(event);
    }

}
