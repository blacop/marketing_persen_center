package com.beukay.marketing.person.domain.composition.gateway;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.composition.model.RenderJob;

public interface RenderJobGateway {

    RenderJob save(RenderJob job);

    RenderJob findById(Long id);

    PageInfo<RenderJob> page(Long projectId, String status, PageQuery pageQuery);
}
