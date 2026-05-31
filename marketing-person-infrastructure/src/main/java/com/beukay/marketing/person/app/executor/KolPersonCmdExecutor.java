package com.beukay.marketing.person.app.executor;

import com.beukay.ai.common.entity.Operator;
import com.beukay.marketing.person.client.cmd.KolPersonCreateCmd;
import com.beukay.marketing.person.domain.kolPerson.ability.KolPersonDomainService;
import com.beukay.marketing.person.domain.kolPerson.model.KolPerson;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

/**
 * KolPerson命令执行器
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class KolPersonCmdExecutor {

    private final KolPersonDomainService kolPersonDomainService;

    public Long createKolPerson(KolPersonCreateCmd cmd) {
        KolPerson kolPerson = KolPerson.builder()
                .name(cmd.getName())
                .description(cmd.getDescription())
                .status("ACTIVE")
                .build();
        kolPerson.buildInsert(new Operator(0L, "system"));
        return kolPersonDomainService.create(kolPerson);
    }

}
