package com.beukay.marketing.person.domain.kolPerson.ability;

import com.beukay.marketing.person.domain.kolPerson.model.KolPerson;

/**
 * KolPerson领域服务
 */
public interface KolPersonDomainService {

    Long create(KolPerson kolPerson);

    void update(KolPerson kolPerson);

    KolPerson queryById(Long id);

    KolPerson queryByName(String name);

}
