package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.marketing.person.app.convertor.KolPersonDTOConvertor;
import com.beukay.marketing.person.client.dto.KolPersonDTO;
import com.beukay.marketing.person.client.qry.KolPersonPageQry;
import com.beukay.marketing.person.domain.kolPerson.gateway.KolPersonGateway;
import com.beukay.marketing.person.domain.kolPerson.model.KolPerson;
import com.beukay.marketing.person.domain.kolPerson.model.KolPersonListCriteriaQuery;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * KolPerson查询执行器
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class KolPersonQryExecutor {

    private final KolPersonGateway kolPersonGateway;

    public PageInfo<KolPersonDTO> listKolPersonPage(KolPersonPageQry qry) {
        PageInfo<KolPerson> pageInfo = kolPersonGateway.listPage(
                KolPersonListCriteriaQuery.builder()
                        .name(qry.getName())
                        .status(qry.getStatus())
                        .build(),
                qry.getPageQuery());

        List<KolPersonDTO> list = pageInfo.getRecords().stream()
                .map(KolPersonDTOConvertor.INSTANCE::convert)
                .collect(Collectors.toList());

        PageInfo<KolPersonDTO> result = new PageInfo<>();
        result.setPageSize(pageInfo.getPageSize());
        result.setPageIndex(pageInfo.getPageIndex());
        result.setTotal(pageInfo.getTotal());
        result.setRecords(list);
        return result;
    }

}
