package com.beukay.marketing.person.domain.kolPerson.ability.impl;

import com.beukay.marketing.person.domain.kolPerson.ability.KolPersonDomainService;
import com.beukay.marketing.person.domain.kolPerson.gateway.KolPersonGateway;
import com.beukay.marketing.person.domain.kolPerson.model.KolPerson;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * KolPerson领域服务实现
 */
@Service
@RequiredArgsConstructor
public class KolPersonDomainServiceImpl implements KolPersonDomainService {

    private final KolPersonGateway kolPersonGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(KolPerson kolPerson) {
        return kolPersonGateway.create(kolPerson);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(KolPerson kolPerson) {
        kolPersonGateway.update(kolPerson);
    }

    @Override
    public KolPerson queryById(Long id) {
        return kolPersonGateway.queryById(id);
    }

    @Override
    public KolPerson queryByName(String name) {
        return kolPersonGateway.queryByName(name);
    }

}
