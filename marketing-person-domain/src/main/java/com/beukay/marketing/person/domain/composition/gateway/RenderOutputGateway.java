package com.beukay.marketing.person.domain.composition.gateway;

import com.beukay.marketing.person.domain.composition.model.RenderOutput;

import java.util.List;

public interface RenderOutputGateway {

    RenderOutput save(RenderOutput output);

    RenderOutput findById(Long id);

    List<RenderOutput> findByJobId(Long jobId);
}
