package com.beukay.marketing.person.domain.productTruth.gateway;

import com.beukay.marketing.person.domain.productTruth.model.ProductTruth;

public interface ProductTruthGateway {

    ProductTruth queryBySkuId(String skuId);
}
