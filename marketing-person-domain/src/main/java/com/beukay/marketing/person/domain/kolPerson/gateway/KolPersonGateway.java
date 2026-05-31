package com.beukay.marketing.person.domain.kolPerson.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.kolPerson.model.KolPerson;
import com.beukay.marketing.person.domain.kolPerson.model.KolPersonListCriteriaQuery;

/**
 * KolPerson Gateway
 */
public interface KolPersonGateway {

    Long create(KolPerson kolPerson);

    void update(KolPerson kolPerson);

    KolPerson queryById(Long id);

    KolPerson queryByName(String name);

    PageInfo<KolPerson> listPage(KolPersonListCriteriaQuery criteriaQuery, PageQuery pageQuery);

}
