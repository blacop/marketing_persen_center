package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.ai.common.mybatis.util.PageUtil;
import com.beukay.marketing.person.dbsdk.dao.ContentPatternKnowledgeDOMapper;
import com.beukay.marketing.person.dbsdk.model.ContentPatternKnowledgeDO;
import com.beukay.marketing.person.domain.contentPatternKnowledge.gateway.ContentPatternKnowledgeGateway;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledge;
import com.beukay.marketing.person.domain.contentPatternKnowledge.model.ContentPatternKnowledgeListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.convertor.ContentPatternKnowledgeConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ContentPatternKnowledgeGatewayImpl implements ContentPatternKnowledgeGateway {

    private final ContentPatternKnowledgeDOMapper mapper;

    @Override
    public Long create(ContentPatternKnowledge knowledge) {
        ContentPatternKnowledgeDO doObj = ContentPatternKnowledgeConvertor.INSTANCE.to(knowledge);
        mapper.insert(doObj);
        return doObj.getId();
    }

    @Override
    public void update(ContentPatternKnowledge knowledge) {
        mapper.updateById(ContentPatternKnowledgeConvertor.INSTANCE.to(knowledge));
    }

    @Override
    public ContentPatternKnowledge queryById(Long id) {
        ContentPatternKnowledgeDO doObj = mapper.selectById(id);
        return doObj == null ? null : ContentPatternKnowledgeConvertor.INSTANCE.from(doObj);
    }

    @Override
    public ContentPatternKnowledge queryByKnowledgeId(String knowledgeId) {
        ContentPatternKnowledgeDO doObj = mapper.selectOne(new LambdaQueryWrapper<ContentPatternKnowledgeDO>()
                .eq(ContentPatternKnowledgeDO::getKnowledgeId, knowledgeId)
                .eq(ContentPatternKnowledgeDO::getIsDeleted, 0)
                .last("limit 1"));
        return doObj == null ? null : ContentPatternKnowledgeConvertor.INSTANCE.from(doObj);
    }

    @Override
    public PageInfo<ContentPatternKnowledge> listPage(ContentPatternKnowledgeListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
        IPage<ContentPatternKnowledgeDO> page = mapper.selectPage(PageUtil.toIPage(pageQuery),
                new LambdaQueryWrapper<ContentPatternKnowledgeDO>()
                        .eq(ContentPatternKnowledgeDO::getIsDeleted, 0)
                        .eq(criteriaQuery.getSkuId() != null && !criteriaQuery.getSkuId().isBlank(), ContentPatternKnowledgeDO::getSkuId, criteriaQuery.getSkuId())
                        .eq(criteriaQuery.getMarketingNode() != null && !criteriaQuery.getMarketingNode().isBlank(), ContentPatternKnowledgeDO::getMarketingNode, criteriaQuery.getMarketingNode())
                        .eq(criteriaQuery.getHookType() != null && !criteriaQuery.getHookType().isBlank(), ContentPatternKnowledgeDO::getHookType, criteriaQuery.getHookType())
                        .eq(criteriaQuery.getVerificationStatus() != null && !criteriaQuery.getVerificationStatus().isBlank(), ContentPatternKnowledgeDO::getVerificationStatus, criteriaQuery.getVerificationStatus())
                        .orderByDesc(ContentPatternKnowledgeDO::getPatternScore)
                        .orderByDesc(ContentPatternKnowledgeDO::getId));

        List<ContentPatternKnowledge> records = page.getRecords().stream()
                .map(ContentPatternKnowledgeConvertor.INSTANCE::from)
                .collect(Collectors.toList());
        return PageUtil.of(records, page.getTotal(), page.getSize(), page.getCurrent());
    }
}
