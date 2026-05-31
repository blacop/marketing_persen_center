package com.beukay.marketing.person.app.cutmatrix;

import com.beukay.ai.common.entity.BaseFields;
import com.beukay.marketing.person.client.cmd.CmCollectionCreateCmd;
import com.beukay.marketing.person.client.dto.CmCollectionDTO;
import com.beukay.marketing.person.client.qry.CmCollectionListQry;
import com.beukay.marketing.person.domain.cutmatrix.collection.gateway.CmCollectionGateway;
import com.beukay.marketing.person.domain.cutmatrix.collection.model.CmCollection;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Log4j2
public class CmCollectionExecutor {

    private final CmCollectionGateway gateway;

    public CmCollectionDTO create(CmCollectionCreateCmd cmd) {
        String code = "cmc-" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        BaseFields baseFields = BaseFields.builder()
                .createAt(LocalDateTime.now())
                .updateAt(LocalDateTime.now())
                .isDeleted(false)
                .build();
        CmCollection collection = CmCollection.builder()
                .collectionCode(code)
                .name(cmd.getName())
                .skuId(cmd.getSkuId())
                .mode(cmd.getMode() == null ? "PARAGRAPH_ALIGN" : cmd.getMode())
                .baseFields(baseFields)
                .build();
        gateway.save(collection);
        return CmCollectionDTO.builder()
                .id(collection.getId())
                .collectionCode(code)
                .name(collection.getName())
                .skuId(collection.getSkuId())
                .mode(collection.getMode())
                .createAt(baseFields.getCreateAt())
                .build();
    }

    public List<CmCollectionDTO> list(CmCollectionListQry qry) {
        return gateway.listAll().stream()
                .filter(c -> qry == null || qry.getSkuId() == null || qry.getSkuId().equals(c.getSkuId()))
                .filter(c -> qry == null || qry.getMode() == null || qry.getMode().equals(c.getMode()))
                .map(c -> CmCollectionDTO.builder()
                        .id(c.getId())
                        .collectionCode(c.getCollectionCode())
                        .name(c.getName())
                        .skuId(c.getSkuId())
                        .mode(c.getMode())
                        .createAt(c.getBaseFields() == null ? null : c.getBaseFields().getCreateAt())
                        .createName(c.getBaseFields() == null ? null : c.getBaseFields().getCreateName())
                        .build())
                .toList();
    }

    public boolean delete(String collectionCode) {
        gateway.deleteByCode(collectionCode);
        return true;
    }
}
