package com.beukay.marketing.person.app.cutmatrix.compliance;

import com.beukay.ai.common.entity.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Log4j2
public class CmComplianceController {

    private final CmComplianceService service;

    /** 话术合规审核：标记风险句 + 修改建议 */
    @PostMapping("/cm/compliance/audit")
    public Result<CmComplianceDtos.AuditResult> audit(@RequestBody CmComplianceDtos.AuditCmd cmd) {
        return Result.success(service.audit(cmd));
    }
}
