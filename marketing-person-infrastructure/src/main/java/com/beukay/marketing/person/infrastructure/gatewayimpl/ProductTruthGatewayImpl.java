package com.beukay.marketing.person.infrastructure.gatewayimpl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.beukay.marketing.person.dbsdk.dao.ProductTruthDOMapper;
import com.beukay.marketing.person.dbsdk.model.ProductTruthDO;
import com.beukay.marketing.person.domain.productTruth.gateway.ProductTruthGateway;
import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;
import com.beukay.marketing.person.infrastructure.convertor.ProductTruthConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductTruthGatewayImpl implements ProductTruthGateway {

    private final ProductTruthDOMapper mapper;

    @Override
    public ProductTruth queryBySkuId(String skuId) {
        ProductTruthDO doObj = mapper.selectOne(new LambdaQueryWrapper<ProductTruthDO>()
                .eq(ProductTruthDO::getSkuId, skuId)
                .eq(ProductTruthDO::getIsDeleted, 0)
                .last("limit 1"));
        return doObj == null ? null : ProductTruthConvertor.INSTANCE.from(doObj);
    }
}
