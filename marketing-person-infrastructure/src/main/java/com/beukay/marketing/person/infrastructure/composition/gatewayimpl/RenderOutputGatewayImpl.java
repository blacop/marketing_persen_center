package com.beukay.marketing.person.infrastructure.composition.gatewayimpl;

import com.beukay.marketing.person.dbsdk.composition.dao.RenderOutputDOMapper;
import com.beukay.marketing.person.dbsdk.composition.model.RenderOutputDO;
import com.beukay.marketing.person.domain.composition.gateway.RenderOutputGateway;
import com.beukay.marketing.person.domain.composition.model.RenderOutput;
import com.beukay.marketing.person.infrastructure.composition.convertor.RenderOutputConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class RenderOutputGatewayImpl implements RenderOutputGateway {

    private final RenderOutputDOMapper mapper;

    @Override
    public RenderOutput save(RenderOutput output) {
        if (output.getBaseFields() == null) {
            output.setBaseFields(CompositionBaseFieldsHelper.fallbackForInsert());
        }
        RenderOutputDO data = RenderOutputConvertor.INSTANCE.to(output);
        if (data.getId() == null) {
            mapper.insert(data);
        } else {
            mapper.update(data);
        }
        RenderOutputDO row = mapper.selectById(data.getId());
        return RenderOutputConvertor.INSTANCE.from(row != null ? row : data);
    }

    @Override
    public RenderOutput findById(Long id) {
        return RenderOutputConvertor.INSTANCE.from(mapper.selectById(id));
    }

    @Override
    public List<RenderOutput> findByJobId(Long jobId) {
        return RenderOutputConvertor.INSTANCE.from(mapper.selectByJobId(jobId));
    }
}
