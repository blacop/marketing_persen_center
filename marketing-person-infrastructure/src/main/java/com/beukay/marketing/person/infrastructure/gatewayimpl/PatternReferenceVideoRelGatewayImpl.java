package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.beukay.marketing.person.dbsdk.dao.PatternReferenceVideoRelDOMapper;
import com.beukay.marketing.person.dbsdk.model.PatternReferenceVideoRelDO;
import com.beukay.marketing.person.domain.patternReferenceVideoRel.gateway.PatternReferenceVideoRelGateway;
import com.beukay.marketing.person.domain.patternReferenceVideoRel.model.PatternReferenceVideoRel;
import com.beukay.marketing.person.infrastructure.convertor.PatternReferenceVideoRelConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PatternReferenceVideoRelGatewayImpl implements PatternReferenceVideoRelGateway {

    private final PatternReferenceVideoRelDOMapper mapper;

    @Override
    public Long create(PatternReferenceVideoRel rel) {
        PatternReferenceVideoRelDO doObj = PatternReferenceVideoRelConvertor.INSTANCE.to(rel);
        mapper.insert(doObj);
        return doObj.getId();
    }

    @Override
    public void softDeleteByKnowledgeId(String knowledgeId) {
        mapper.update(null, new LambdaUpdateWrapper<PatternReferenceVideoRelDO>()
                .set(PatternReferenceVideoRelDO::getIsDeleted, 1)
                .eq(PatternReferenceVideoRelDO::getKnowledgeId, knowledgeId)
                .eq(PatternReferenceVideoRelDO::getIsDeleted, 0));
    }

    @Override
    public List<PatternReferenceVideoRel> listByKnowledgeId(String knowledgeId) {
        return mapper.selectList(new LambdaQueryWrapper<PatternReferenceVideoRelDO>()
                        .eq(PatternReferenceVideoRelDO::getKnowledgeId, knowledgeId)
                        .eq(PatternReferenceVideoRelDO::getIsDeleted, 0)
                        .orderByDesc(PatternReferenceVideoRelDO::getReferenceScore)
                        .orderByDesc(PatternReferenceVideoRelDO::getId))
                .stream()
                .map(PatternReferenceVideoRelConvertor.INSTANCE::from)
                .collect(Collectors.toList());
    }
}
