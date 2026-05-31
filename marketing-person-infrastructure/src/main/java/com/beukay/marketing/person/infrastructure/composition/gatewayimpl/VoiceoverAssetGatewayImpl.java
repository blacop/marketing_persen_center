package com.beukay.marketing.person.infrastructure.composition.gatewayimpl;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.dbsdk.composition.dao.VoiceoverAssetDOMapper;
import com.beukay.marketing.person.dbsdk.composition.model.VoiceoverAssetDO;
import com.beukay.marketing.person.domain.composition.gateway.VoiceoverAssetGateway;
import com.beukay.marketing.person.domain.composition.model.VoiceoverAsset;
import com.beukay.marketing.person.infrastructure.composition.convertor.VoiceoverAssetConvertor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class VoiceoverAssetGatewayImpl implements VoiceoverAssetGateway {

    private final VoiceoverAssetDOMapper mapper;

    @Override
    public VoiceoverAsset create(VoiceoverAsset asset) {
        if (asset.getBaseFields() == null) {
            asset.setBaseFields(CompositionBaseFieldsHelper.fallbackForInsert());
        }
        VoiceoverAssetDO data = VoiceoverAssetConvertor.INSTANCE.to(asset);
        mapper.insert(data);
        // 多租户拦截器在 FAT 环境无 holder 上下文时会让 selectById 返回 null；fallback 到刚写入的 DO。
        VoiceoverAssetDO row = mapper.selectById(data.getId());
        return VoiceoverAssetConvertor.INSTANCE.from(row != null ? row : data);
    }

    @Override
    public VoiceoverAsset findById(Long id) {
        return VoiceoverAssetConvertor.INSTANCE.from(mapper.selectById(id));
    }

    @Override
    public PageInfo<VoiceoverAsset> page(String source, String text, String category, PageQuery pageQuery) {
        long pageIndex = pageQuery == null || pageQuery.getPageIndex() == null ? 1L : pageQuery.getPageIndex();
        long pageSize = pageQuery == null || pageQuery.getPageSize() == null ? 20L : pageQuery.getPageSize();
        long offset = (pageIndex - 1) * pageSize;

        long total = mapper.countPage(source, text, category);
        List<VoiceoverAssetDO> rows = total == 0 ? List.of()
                : mapper.selectPage(source, text, category, offset, (int) pageSize);
        return PageInfo.<VoiceoverAsset>builder()
                .pageIndex(pageIndex)
                .pageSize(pageSize)
                .total(total)
                .records(VoiceoverAssetConvertor.INSTANCE.from(rows))
                .build();
    }

    @Override
    public void softDelete(Long id) {
        mapper.softDelete(id);
    }
}
