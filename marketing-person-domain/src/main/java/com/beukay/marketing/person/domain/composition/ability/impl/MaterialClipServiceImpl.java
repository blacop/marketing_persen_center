package com.beukay.marketing.person.domain.composition.ability.impl;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.PageQuery;
import com.beukay.marketing.person.domain.composition.ability.MaterialClipService;
import com.beukay.marketing.person.domain.composition.gateway.MaterialClipGateway;
import com.beukay.marketing.person.domain.composition.model.MaterialClip;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialClipServiceImpl implements MaterialClipService {

    private final MaterialClipGateway materialClipGateway;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MaterialClip create(MaterialClip clip, List<Long> tagIds) {
        if (clip.getSha256() != null && !clip.getSha256().isBlank()) {
            MaterialClip exist = materialClipGateway.findBySha256(clip.getSha256());
            if (exist != null) {
                return exist;
            }
        }
        try {
            return materialClipGateway.create(clip, tagIds);
        } catch (DuplicateKeyException e) {
            // 并发或 FAT 环境租户上下文不一致下，pre-check 可能漏掉已存在的同 sha256 行；
            // 由唯一键 uk_sha256_tenant 兜底，撞键后回查复用现有记录，保证幂等。
            if (clip.getSha256() == null || clip.getSha256().isBlank()) {
                throw e;
            }
            MaterialClip exist = materialClipGateway.findBySha256(clip.getSha256());
            if (exist == null) {
                throw e;
            }
            return exist;
        }
    }

    @Override
    public MaterialClip getById(Long id) {
        return materialClipGateway.findById(id);
    }

    @Override
    public PageInfo<MaterialClip> page(String kind, String name, List<Long> tagIds,
                                       String sourceType, String category, PageQuery pageQuery) {
        return materialClipGateway.page(kind, name, tagIds, sourceType, category, pageQuery);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MaterialClip updateTags(Long id, List<Long> tagIds) {
        return materialClipGateway.replaceTags(id, tagIds);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        materialClipGateway.softDelete(id);
    }
}
