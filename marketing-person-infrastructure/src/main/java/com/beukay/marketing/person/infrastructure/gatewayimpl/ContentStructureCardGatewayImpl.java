package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.ai.common.mybatis.util.PageUtil;
import com.beukay.marketing.person.dbsdk.dao.ContentStructureCardDOMapper;
import com.beukay.marketing.person.dbsdk.model.ContentStructureCardDO;
import com.beukay.marketing.person.domain.contentStructureCard.gateway.ContentStructureCardGateway;
import com.beukay.marketing.person.domain.contentStructureCard.model.ContentStructureCard;
import com.beukay.marketing.person.domain.contentStructureCard.model.ContentStructureCardListCriteriaQuery;
import com.beukay.marketing.person.infrastructure.convertor.ContentStructureCardConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ContentStructureCardGatewayImpl implements ContentStructureCardGateway {

    private final ContentStructureCardDOMapper mapper;

    @Override
    public Long create(ContentStructureCard card) {
        ContentStructureCardDO doObj = ContentStructureCardConvertor.INSTANCE.to(card);
        mapper.insert(doObj);
        return doObj.getId();
    }

    @Override
    public void update(ContentStructureCard card) {
        ContentStructureCardDO doObj = ContentStructureCardConvertor.INSTANCE.to(card);
        mapper.updateById(doObj);
    }

    @Override
    public ContentStructureCard queryById(Long id) {
        ContentStructureCardDO doObj = mapper.selectOne(new LambdaQueryWrapper<ContentStructureCardDO>()
                .eq(ContentStructureCardDO::getId, id)
                .eq(ContentStructureCardDO::getIsDeleted, 0)
                .last("limit 1"));
        return doObj == null ? null : ContentStructureCardConvertor.INSTANCE.from(doObj);
    }

    @Override
    public ContentStructureCard queryByCardId(String cardId) {
        ContentStructureCardDO doObj = mapper.selectOne(new LambdaQueryWrapper<ContentStructureCardDO>()
                .eq(ContentStructureCardDO::getCardId, cardId)
                .eq(ContentStructureCardDO::getIsDeleted, 0)
                .last("limit 1"));
        return doObj == null ? null : ContentStructureCardConvertor.INSTANCE.from(doObj);
    }

    @Override
    public PageInfo<ContentStructureCard> listPage(ContentStructureCardListCriteriaQuery criteriaQuery, PageQuery pageQuery) {
        IPage<ContentStructureCardDO> page = mapper.selectPage(PageUtil.toIPage(pageQuery),
                new LambdaQueryWrapper<ContentStructureCardDO>()
                        .eq(ContentStructureCardDO::getIsDeleted, 0)
                        .eq(StringUtils.hasText(criteriaQuery.getSkuId()), ContentStructureCardDO::getSkuId, criteriaQuery.getSkuId())
                        .eq(StringUtils.hasText(criteriaQuery.getHookType()), ContentStructureCardDO::getHookType, criteriaQuery.getHookType())
                        .eq(StringUtils.hasText(criteriaQuery.getMarketingNode()), ContentStructureCardDO::getMarketingNode, criteriaQuery.getMarketingNode())
                        .eq(StringUtils.hasText(criteriaQuery.getStatus()), ContentStructureCardDO::getStatus, criteriaQuery.getStatus())
                        .orderByDesc(ContentStructureCardDO::getCreateAt));
        List<ContentStructureCard> records = page.getRecords().stream()
                .map(ContentStructureCardConvertor.INSTANCE::from)
                .collect(Collectors.toList());
        return PageUtil.of(records, page.getTotal(), page.getSize(), page.getCurrent());
    }
}
